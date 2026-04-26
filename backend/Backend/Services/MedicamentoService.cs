using Backend.DTOs.Medicamentos;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Medicamentos;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using System.Diagnostics;
namespace Backend.Services
{
    public class MedicamentosService : IMedicamentosService
    {
        private readonly IMedicamentosRepository _repository;
        private readonly IUserSessionService _userSessionService;

        public MedicamentosService(IMedicamentosRepository repository, IUserSessionService userSessionService)
        {
            _repository = repository;
            _userSessionService = userSessionService;
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

        public async Task<IEnumerable<MedicamentosModel>> BuscarTodosAsync(MedicamentosFiltroDTO filtro) => await _repository.GetAsync(filtro);






    }
}