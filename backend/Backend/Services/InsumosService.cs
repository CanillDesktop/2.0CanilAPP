using Backend.DTOs.Insumos;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using System.Diagnostics;

namespace Backend.Services
{
    public class InsumosService : IInsumosService
    {
        public readonly IInsumosRepository _repository;
        public readonly IUserSessionService _userSessionService;

        public InsumosService(IInsumosRepository repository, IUserSessionService userSessionService)
        {
            _repository = repository;
            _userSessionService = userSessionService;
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
            if (string.IsNullOrWhiteSpace(model.Codigo)
                || string.IsNullOrWhiteSpace(model.DescricaoSimplificada)
                || !Enum.IsDefined(typeof(UnidadeInsumosEnum), (int)model.Unidade)
                || string.IsNullOrWhiteSpace(model.ItensEstoque?.FirstOrDefault()?.Lote))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
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

                Debug.WriteLine($"[InsumosService] ✅ Insumo encontrado: ID={insumoExistente.Id}");

                insumoExistente.DescricaoSimplificada = model.DescricaoSimplificada;
                insumoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                insumoExistente.Unidade = model.Unidade;

                Debug.WriteLine($"[InsumosService] ✅ Campos escalares atualizados");

                var itemEstoque = model.ItensEstoque?.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(itemEstoque?.Lote))
                {
                    var loteExistente = insumoExistente.ItensEstoque
                        ?.FirstOrDefault(e => e.Lote == itemEstoque.Lote);

                    if (loteExistente != null)
                    {

                        Debug.WriteLine($"[InsumosService] ♻️  Atualizando lote existente: {itemEstoque.Lote}");
                        Debug.WriteLine($"   Quantidade: {loteExistente.Quantidade} → {itemEstoque.Quantidade}");

                        loteExistente.Quantidade = itemEstoque.Quantidade;
                        loteExistente.DataEntrega = itemEstoque.DataEntrega;
                        loteExistente.DataValidade = itemEstoque.DataValidade;
                        loteExistente.NFe = itemEstoque.NFe;

                        loteExistente.DataHoraAtualizacao = DateTime.UtcNow;
                        Debug.WriteLine($"   DataHoraAtualizacao: {loteExistente.DataHoraAtualizacao}");
                    }
                    else
                    {
                        Debug.WriteLine($"[InsumosService] ➕ Adicionando novo lote: {itemEstoque.Lote}");
                        Debug.WriteLine($"   Quantidade: {itemEstoque.Quantidade}");

                        var novoLote = new ItemEstoqueModel
                        {
                            Id = insumoExistente.Id,
                            Codigo = insumoExistente.Codigo,
                            Lote = itemEstoque.Lote,
                            Quantidade = itemEstoque.Quantidade,
                            DataEntrega = itemEstoque.DataEntrega,
                            DataValidade = itemEstoque.DataValidade,
                            NFe = itemEstoque.NFe,
                            DataHoraCriacao = DateTime.UtcNow
                        };

                        insumoExistente.ItensEstoque ??= new List<ItemEstoqueModel>();

                        insumoExistente.ItensEstoque.Add(novoLote);

                        Debug.WriteLine($"   DataHoraCriacao: {novoLote.DataHoraCriacao}");
                    }

                    var quantidadeTotal = insumoExistente.ItensEstoque?.Sum(x => x.Quantidade) ?? 0;

                    if (quantidadeTotal <= 0)
                    {
                        insumoExistente.IsDeleted = true;
                        Debug.WriteLine($"[Service] 🗑️ Estoque zerado (Total: {quantidadeTotal}). Marcando {insumoExistente.Codigo} como deletado.");
                    }
                    insumoExistente.IsDeleted = false;
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

        public async Task<IEnumerable<InsumosModel>> BuscarTodosAsync(InsumosFiltroDTO filtro) => await _repository.GetAsync(filtro);
    }
}