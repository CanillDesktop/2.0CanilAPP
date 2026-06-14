using Backend.DTOs;
using Backend.DTOs.Medicamentos;
using Backend.Exceptions;
using Backend.Filtro.Medicamentos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Medicamentos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
namespace Backend.Services
{
    public class MedicamentosService : IMedicamentosService
    {
        private readonly IMedicamentosRepository _repository;
        private readonly IUserSessionService _userSessionService;
        private readonly IConfiguration _configuration;

        public MedicamentosService(IMedicamentosRepository repository, IUserSessionService userSessionService, IConfiguration configuration)
        {
            _repository = repository;
            _userSessionService = userSessionService;
            _configuration = configuration;
        }

        public async Task<IEnumerable<MedicamentosModel>> BuscarTodosAsync() => await _repository.GetAsync();

        public async Task<MedicamentosModel?> BuscarPorIdAsync(int id) => (await _repository.GetByIdAsync(id))!;


        public async Task<MedicamentosModel?> CriarAsync(MedicamentosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Codigo)
                || string.IsNullOrWhiteSpace(model.NomeComercial)
                || string.IsNullOrWhiteSpace(model.Formula)
                || string.IsNullOrWhiteSpace(model.Descricao)
                || !Enum.IsDefined(typeof(PrioridadeEnum), (int)model.Prioridade)
                || !Enum.IsDefined(typeof(PublicoAlvoMedicamentoEnum), (int)model.PublicoAlvo)
                || string.IsNullOrWhiteSpace(model.ItensEstoque?.FirstOrDefault()?.Lote))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }

            model.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

            return await _repository.CreateAsync(model);
        }

        public async Task<MedicamentosModel?> AtualizarAsync(int id, MedicamentosModel model)
        {
            try
            {
                var medicamentoExistente = await _repository.GetByIdAsync(id);

                if (medicamentoExistente == null)
                {
                    throw new ArgumentNullException(null, $"Medicamento de id {id} não encontrado");
                }

                medicamentoExistente.Descricao = model.Descricao;
                medicamentoExistente.Formula = model.Formula;
                medicamentoExistente.NomeComercial = model.NomeComercial;
                medicamentoExistente.PublicoAlvo = model.PublicoAlvo;
                medicamentoExistente.Prioridade = model.Prioridade;

                var itemEstoque = model.ItensEstoque?.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(itemEstoque?.Lote))
                {
                    var loteExistente = medicamentoExistente.ItensEstoque
                        ?.FirstOrDefault(e => e.Lote == itemEstoque.Lote);

                    if (loteExistente != null)
                    {
                        loteExistente.Quantidade = itemEstoque.Quantidade;
                        loteExistente.DataEntrega = itemEstoque.DataEntrega;
                        loteExistente.DataValidade = itemEstoque.DataValidade;
                        loteExistente.NFe = itemEstoque.NFe;
                        loteExistente.DataHoraAtualizacao = DateTime.UtcNow;
                    }
                    else
                    {
                        var novoLote = new ItemEstoqueModel
                        {
                            Id = medicamentoExistente.Id,
                            Codigo = medicamentoExistente.Codigo,
                            Lote = itemEstoque.Lote,
                            Quantidade = itemEstoque.Quantidade,
                            DataEntrega = itemEstoque.DataEntrega,
                            DataValidade = itemEstoque.DataValidade,
                            NFe = itemEstoque.NFe,
                            DataHoraCriacao = DateTime.UtcNow
                        };

                        medicamentoExistente.ItensEstoque ??= new List<ItemEstoqueModel>();

                        medicamentoExistente.ItensEstoque.Add(novoLote);
                    }

                    var quantidadeTotal = medicamentoExistente.ItensEstoque?.Sum(x => x.Quantidade) ?? 0;

                    if (quantidadeTotal <= 0)
                    {
                        medicamentoExistente.IsDeleted = true;
                    }
                    medicamentoExistente.IsDeleted = false;
                }

                if (medicamentoExistente.ItemNivelEstoque != null)
                {
                    medicamentoExistente.ItemNivelEstoque.NivelMinimoEstoque = model.ItemNivelEstoque.NivelMinimoEstoque;
                }

                medicamentoExistente.DataHoraAtualizacao = DateTime.UtcNow;
                medicamentoExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                var resultado = await _repository.UpdateAsync(medicamentoExistente);
                return resultado;
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentNullException(null, ex.Message);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                throw new ConflitoDeConcorrenciaEstoqueException(
                    EstoqueConcurrencyMessages.ItemAlteradoPorOutraOperacao,
                    ex);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"[MedicamentosService] ❌ Erro ao atualizar produto: {ex.Message}");
                Debug.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var medicamento = await BuscarPorIdAsync(id);

            if (medicamento == null) return false;

            medicamento.IsDeleted = true;
            medicamento.DataHoraAtualizacao = DateTime.UtcNow;

            return await _repository.DeleteAsync(medicamento);
        }

        public async Task<ItemComEstoqueListaPaginadaDTO<MedicamentoLeituraDTO>> BuscarPaginadoAsync(
            MedicamentosFiltro filtro,
            ItensPaginationParameters produtosParameters,
            CancellationToken cancellationToken = default)
        {
            var diasDataLimiteVencimento = _configuration.GetValue("RegrasDeNegocio:DiasDataLimiteVencimentoItens", 30);

            var consulta = await _repository.ConsultarPaginadoAsync(filtro, produtosParameters, diasDataLimiteVencimento, cancellationToken);

            var pageNumber = Math.Max(produtosParameters.PageNumber, 1);
            var pageSize = produtosParameters.PageSize;
            var totalPages = consulta.TotalCount == 0
                ? 0
                : (int)Math.Ceiling(consulta.TotalCount / (double)pageSize);

            return new ItemComEstoqueListaPaginadaDTO<MedicamentoLeituraDTO>
            {
                Items = consulta.Items.Select(p => (MedicamentoLeituraDTO)p).ToList(),
                TotalCount = consulta.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                Resumo = new ItemComEstoqueListaResumoDTO
                {
                    TotalNoRecorte = consulta.Resumo.TotalNoRecorte,
                    Ativos = consulta.Resumo.Ativos,
                    BaixoEstoque = consulta.Resumo.BaixoEstoque,
                    SemEstoque = consulta.Resumo.SemEstoque,
                    AVencer = consulta.Resumo.AVencer,
                },
            };
        }

    }
}