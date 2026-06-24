using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class EstoqueItemService : IEstoqueItemService
    {
        private readonly IEstoqueItemRepository _repository;
        private readonly IUserSessionService _userSessionService;
        private readonly ILoteGeradorService _loteGerador;

        public EstoqueItemService(
            IEstoqueItemRepository repository,
            IUserSessionService userSessionService,
            ILoteGeradorService loteGerador)
        {
            _repository = repository;
            _userSessionService = userSessionService;
            _loteGerador = loteGerador;
        }

        public async Task<IEnumerable<ItemEstoqueModel>> BuscarPorCodigoAsync(string codigo) => await _repository.GetByCodigoAsync(codigo);

        public async Task<ItemEstoqueModel?> BuscarPorLoteAsync(string lote) => await _repository.GetByLoteAsync(lote);

        public async Task<ProximoLoteEstoqueDTO> GerarProximoLoteAsync(int itemId)
        {
            var itemBase = await _repository.ObterItemBasePorIdAsync(itemId)
                ?? throw new RecursoNaoEncontradoException("Item não encontrado para gerar o lote.");

            // Conferência: prevê o número sem consumir a sequência. O valor definitivo é gerado na criação.
            return new ProximoLoteEstoqueDTO
            {
                Codigo = ObterCodigoItem(itemBase),
                Lote = await PreverLoteAsync(itemBase)
            };
        }

        public Task<ItemEstoqueModel?> CriarAsync(ItemEstoqueModel model)
        {
            throw new RegraDeNegocioInfringidaException(
                "Use POST /api/Estoque/entradas para registrar compra ou doação na unidade ativa.");
        }

        private Task<string> GerarLoteAsync(ItemComEstoqueBaseModel itemBase) => itemBase switch
        {
            ProdutosModel produto => _loteGerador.GerarLoteProdutoAsync(produto.Categoria, produto.DescricaoSimples),
            MedicamentosModel medicamento => _loteGerador.GerarLoteMedicamentoAsync(medicamento.PublicoAlvo, medicamento.NomeComercial),
            InsumosModel insumo => _loteGerador.GerarLoteInsumoAsync(insumo.Unidade, insumo.DescricaoSimplificada),
            _ => throw new RegraDeNegocioInfringidaException("Tipo de item não suportado para geração de lote.")
        };

        private Task<string> PreverLoteAsync(ItemComEstoqueBaseModel itemBase) => itemBase switch
        {
            ProdutosModel produto => _loteGerador.PreverProximoLoteProdutoAsync(produto.Categoria, produto.DescricaoSimples),
            MedicamentosModel medicamento => _loteGerador.PreverProximoLoteMedicamentoAsync(medicamento.PublicoAlvo, medicamento.NomeComercial),
            InsumosModel insumo => _loteGerador.PreverProximoLoteInsumoAsync(insumo.Unidade, insumo.DescricaoSimplificada),
            _ => throw new RegraDeNegocioInfringidaException("Tipo de item não suportado para geração de lote.")
        };

        private static string ObterCodigoItem(ItemComEstoqueBaseModel itemBase) => itemBase switch
        {
            ProdutosModel produto => produto.Codigo,
            MedicamentosModel medicamento => medicamento.Codigo,
            InsumosModel insumo => insumo.Codigo,
            _ => throw new RegraDeNegocioInfringidaException("Tipo de item não suportado.")
        };

        public async Task<ItemEstoqueModel?> AtualizarAsync(string lote, ItemEstoqueModel model)
        {
            try
            {
                var itemExistente = await _repository.GetByLoteAsync(lote);

                if (itemExistente == null)
                {
                    throw new ArgumentNullException(null, $"Item de estoque de lote {lote} não encontrado");
                }

                itemExistente.Quantidade = model.Quantidade;

                itemExistente.IsDeleted = model.IsDeleted;
                itemExistente.DataHoraAtualizacao = DateTime.UtcNow;
                itemExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                var result = await _repository.UpdateAsync(itemExistente);
                return result;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                throw new ConflitoDeConcorrenciaEstoqueException(
                    EstoqueConcurrencyMessages.ItemAlteradoPorOutraOperacao,
                    ex);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentNullException(null, ex.Message);
            }
        }

        public async Task<bool> DeletarAsync(string lote)
        {
            try
            {
                var itemEstoque = await _repository.GetByLoteAsync(lote);

                if (itemEstoque == null) return false;

                itemEstoque.IsDeleted = true;
                itemEstoque.DataHoraAtualizacao = DateTime.UtcNow;

                return await _repository.DeleteAsync(itemEstoque);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                throw new ConflitoDeConcorrenciaEstoqueException(
                    EstoqueConcurrencyMessages.ItemAlteradoPorOutraOperacao,
                    ex);
            }
        }
    }
}
