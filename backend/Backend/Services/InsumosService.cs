using Backend.DTOs;
using Backend.DTOs.Insumos;
using Backend.Exceptions;
using Backend.Filtro.Insumos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Backend.Services
{
    public class InsumosService : IInsumosService
    {
        public readonly IInsumosRepository _repository;
        public readonly IUserSessionService _userSessionService;
        private readonly IConfiguration _configuration;
        private readonly ILoteGeradorService _loteGerador;

        public InsumosService(
            IInsumosRepository repository,
            IUserSessionService userSessionService,
            IConfiguration configuration,
            ILoteGeradorService loteGerador)
        {
            _repository = repository;
            _userSessionService = userSessionService;
            _configuration = configuration;
            _loteGerador = loteGerador;
        }

        private static void ValidarCamposObrigatorios(InsumosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.DescricaoSimplificada)
                || string.IsNullOrWhiteSpace(model.DescricaoDetalhada)
                || !Enum.IsDefined(typeof(UnidadeInsumosEnum), (int)model.Unidade))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }
        }

        public async Task<IEnumerable<InsumosModel>> BuscarTodosAsync()
        {
            var insumos = await _repository.GetAsync();

            var quantidade = insumos.Count();
            System.Diagnostics.Debug.WriteLine($"[Service] Itens vindos do banco: {quantidade}");

            foreach (var insumo in insumos)
            {
                System.Diagnostics.Debug.WriteLine($"[Service] Item ID: {insumo.Id} - Nome: {insumo.DescricaoSimplificada}");
            }

            return insumos;
        }

        public async Task<InsumosModel?> BuscarPorIdAsync(int id) => (await _repository.GetByIdAsync(id))!;

        public async Task<InsumosModel?> CriarAsync(InsumosModel model)
        {
            ValidarCamposObrigatorios(model);

            var itemInicial = model.ItensEstoque?.FirstOrDefault();
            if (itemInicial != null && itemInicial.Quantidade > 0)
            {
                itemInicial.Codigo = model.Codigo;
                itemInicial.Lote = await _loteGerador.GerarLoteInsumoAsync(model.Unidade, model.DescricaoSimplificada);
                model.ItensEstoque = new List<ItemEstoqueModel> { itemInicial };
            }
            else
            {
                model.ItensEstoque = new List<ItemEstoqueModel>();
            }

            model.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

            return await _repository.CreateAsync(model);
        }

        public async Task<InsumosModel?> AtualizarAsync(int id, InsumosModel model)
        {
            try
            {
                Debug.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                Debug.WriteLine($"[InsumosService] 🔄 Atualizando insumo: {id} - {model.DescricaoSimplificada} ");

                var insumoExistente = await _repository.GetByIdAsync(id);

                if (insumoExistente == null)
                {
                    Debug.WriteLine($"[InsumosService] ❌ Insumo não encontrado");
                    throw new ArgumentNullException(null, $"Insumo de id {id} não encontrado");
                }

                ValidarCamposObrigatorios(model);

                Debug.WriteLine($"[InsumosService] ✅ Insumo encontrado: ID={insumoExistente.Id}");

                insumoExistente.DescricaoSimplificada = model.DescricaoSimplificada;
                insumoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                insumoExistente.Unidade = model.Unidade;

                // Entrada de novo estoque na edição: o lote é sempre gerado pelo backend.
                var itemEstoque = model.ItensEstoque?.FirstOrDefault();
                if (itemEstoque != null && itemEstoque.Quantidade > 0)
                {
                    var novoLote = new ItemEstoqueModel
                    {
                        Id = insumoExistente.Id,
                        Codigo = insumoExistente.Codigo,
                        Lote = await _loteGerador.GerarLoteInsumoAsync(
                            insumoExistente.Unidade,
                            insumoExistente.DescricaoSimplificada),
                        Quantidade = itemEstoque.Quantidade,
                        DataEntrega = itemEstoque.DataEntrega,
                        DataValidade = itemEstoque.DataValidade,
                        NFe = itemEstoque.NFe,
                        DataHoraCriacao = DateTime.UtcNow
                    };

                    insumoExistente.ItensEstoque ??= new List<ItemEstoqueModel>();
                    insumoExistente.ItensEstoque.Add(novoLote);
                }

                if (insumoExistente.ItemNivelEstoque != null)
                {
                    insumoExistente.ItemNivelEstoque.NivelMinimoEstoque = model.ItemNivelEstoque.NivelMinimoEstoque;
                    Debug.WriteLine($"[InsumosService] ✅ Nível mínimo atualizado: {model.ItemNivelEstoque.NivelMinimoEstoque}");
                }

                insumoExistente.DataHoraAtualizacao = DateTime.UtcNow;
                Debug.WriteLine($"[InsumosService] 🔥 DataHoraAtualizacao atualizado: {insumoExistente.DataHoraAtualizacao}");
                insumoExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                var resultado = await _repository.UpdateAsync(insumoExistente);
                Debug.WriteLine($"[InsumosService] ✅ Insumo salvo com sucesso!");
                Debug.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
                Debug.WriteLine($"[InsumosService] ❌ Erro ao atualizar insumo: {ex.Message}");
                Debug.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var insumo = await BuscarPorIdAsync(id);

            if (insumo == null) return false;

            insumo.IsDeleted = true;
            insumo.DataHoraAtualizacao = DateTime.UtcNow;

            return await _repository.DeleteAsync(insumo);
        }

        public async Task<ItemComEstoqueListaPaginadaDTO<InsumosLeituraDTO>> BuscarPaginadoAsync(
            InsumosFiltro filtro,
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

            return new ItemComEstoqueListaPaginadaDTO<InsumosLeituraDTO>
            {
                Items = consulta.Items.Select(p => (InsumosLeituraDTO)p).ToList(),
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