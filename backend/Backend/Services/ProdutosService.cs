using Backend.DTOs.Produtos;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Produtos;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Backend.Pagination;
using Backend.Filtro.Produtos;

namespace Backend.Services
{
    public class ProdutosService : IProdutosService
    {
        private readonly IProdutosRepository _repository;
        private readonly IUserSessionService _userSessionService;

        public ProdutosService(IProdutosRepository repository, IUserSessionService userSessionService)
        {
            _repository = repository;
            _userSessionService = userSessionService;
        }

        public async Task<IEnumerable<ProdutosModel>> BuscarTodosAsync() => await _repository.GetAsync();

        public async Task<ProdutosModel?> BuscarPorIdAsync(int id) => (await _repository.GetByIdAsync(id))!;

        public async Task<ProdutosModel?> CriarAsync(ProdutosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Codigo)
                || string.IsNullOrWhiteSpace(model.DescricaoSimples)
                || !Enum.IsDefined(typeof(UnidadeEnum), (int)model.Unidade)
                || !Enum.IsDefined(typeof(CategoriaEnum), (int)model.Categoria)
                || string.IsNullOrWhiteSpace(model.ItensEstoque?.FirstOrDefault()?.Lote))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }

            model.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

            return await _repository.CreateAsync(model);
        }

        public async Task<ProdutosModel?> AtualizarAsync(int id, ProdutosModel model)
        {
            try
            {
                var produtoExistente = await _repository.GetByIdAsync(id);

                if (produtoExistente == null)
                {
                    throw new ArgumentNullException(null, $"Produto de id {id} não encontrado");
                }

                produtoExistente.DescricaoSimples = model.DescricaoSimples;
                produtoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                produtoExistente.Unidade = model.Unidade;
                produtoExistente.Categoria = model.Categoria;

                var itemEstoque = model.ItensEstoque?.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(itemEstoque?.Lote))
                {
                    var loteExistente = produtoExistente.ItensEstoque
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
                            Id = produtoExistente.Id,
                            Codigo = produtoExistente.Codigo,
                            Lote = itemEstoque.Lote,
                            Quantidade = itemEstoque.Quantidade,
                            DataEntrega = itemEstoque.DataEntrega,
                            DataValidade = itemEstoque.DataValidade,
                            NFe = itemEstoque.NFe,
                            DataHoraCriacao = DateTime.UtcNow
                        };

                        produtoExistente.ItensEstoque ??= new List<ItemEstoqueModel>();

                        produtoExistente.ItensEstoque.Add(novoLote);
                    }

                    var quantidadeTotal = produtoExistente.ItensEstoque?.Sum(x => x.Quantidade) ?? 0;

                    if (quantidadeTotal <= 0)
                    {
                        produtoExistente.IsDeleted = true;
                    }
                    produtoExistente.IsDeleted = false;
                }

                if (produtoExistente.ItemNivelEstoque != null)
                {
                    produtoExistente.ItemNivelEstoque.NivelMinimoEstoque = model.ItemNivelEstoque.NivelMinimoEstoque;
                }

                produtoExistente.DataHoraAtualizacao = DateTime.UtcNow;
                produtoExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                var resultado = await _repository.UpdateAsync(produtoExistente);
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
                Debug.WriteLine($"[ProdutosService] ❌ Erro ao atualizar produto: {ex.Message}");
                Debug.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var produto = await BuscarPorIdAsync(id);

            if (produto == null) return false;

            produto.IsDeleted = true;
            produto.DataHoraAtualizacao = DateTime.UtcNow;

            return await _repository.DeleteAsync(produto);
        }

        public async Task<ProdutosListaPaginadaDTO> BuscarPaginadoAsync(
            ProdutosFiltro filtro,
            ProdutosParameters produtosParameters,
            CancellationToken cancellationToken = default)
        {
            var consulta = await _repository.ConsultarPaginadoAsync(filtro, produtosParameters, cancellationToken);

            var pageNumber = Math.Max(produtosParameters.PageNumber, 1);
            var pageSize = produtosParameters.PageSize;
            var totalPages = consulta.TotalCount == 0
                ? 0
                : (int)Math.Ceiling(consulta.TotalCount / (double)pageSize);

            return new ProdutosListaPaginadaDTO
            {
                Items = consulta.Items.Select(p => (ProdutosLeituraDTO)p).ToList(),
                TotalCount = consulta.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                Resumo = new ProdutosListaResumoDTO
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