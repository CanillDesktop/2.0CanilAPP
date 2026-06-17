using Backend.DTOs;
using Backend.DTOs.Produtos;
using Backend.Exceptions;
using Backend.Filtro.Produtos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Produtos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Backend.Services
{
    public class ProdutosService : IProdutosService
    {
        private readonly IProdutosRepository _repository;
        private readonly IUserSessionService _userSessionService;
        private readonly IConfiguration _configuration;
        private readonly ILoteGeradorService _loteGerador;

        public ProdutosService(
            IProdutosRepository repository,
            IUserSessionService userSessionService,
            IConfiguration configuration,
            ILoteGeradorService loteGerador)
        {
            _repository = repository;
            _userSessionService = userSessionService;
            _configuration = configuration;
            _loteGerador = loteGerador;
        }

        private static void ValidarCamposObrigatorios(ProdutosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.DescricaoSimples)
                || string.IsNullOrWhiteSpace(model.DescricaoDetalhada)
                || !Enum.IsDefined(typeof(UnidadeEnum), (int)model.Unidade)
                || !Enum.IsDefined(typeof(CategoriaEnum), (int)model.Categoria))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }
        }

        public async Task<IEnumerable<ProdutosModel>> BuscarTodosAsync() => await _repository.GetAsync();

        public async Task<ProdutosModel?> BuscarPorIdAsync(int id) => (await _repository.GetByIdAsync(id))!;

        public async Task<ProdutosModel?> CriarAsync(ProdutosModel model)
        {
            ValidarCamposObrigatorios(model);

            // Estoque inicial é opcional. Só geramos lote (no backend) quando há quantidade.
            var itemInicial = model.ItensEstoque?.FirstOrDefault();
            if (itemInicial != null && itemInicial.Quantidade > 0)
            {
                itemInicial.Codigo = model.Codigo;
                itemInicial.Lote = await _loteGerador.GerarLoteProdutoAsync(model.Categoria, model.DescricaoSimples);
                model.ItensEstoque = new List<ItemEstoqueModel> { itemInicial };
            }
            else
            {
                model.ItensEstoque = new List<ItemEstoqueModel>();
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

                ValidarCamposObrigatorios(model);

                produtoExistente.DescricaoSimples = model.DescricaoSimples;
                produtoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                produtoExistente.Unidade = model.Unidade;
                produtoExistente.Categoria = model.Categoria;

                // Entrada de novo estoque na edição: o lote é sempre gerado pelo backend.
                var itemEstoque = model.ItensEstoque?.FirstOrDefault();
                if (itemEstoque != null && itemEstoque.Quantidade > 0)
                {
                    var novoLote = new ItemEstoqueModel
                    {
                        Id = produtoExistente.Id,
                        Codigo = produtoExistente.Codigo,
                        Lote = await _loteGerador.GerarLoteProdutoAsync(
                            produtoExistente.Categoria,
                            produtoExistente.DescricaoSimples),
                        Quantidade = itemEstoque.Quantidade,
                        DataEntrega = itemEstoque.DataEntrega,
                        DataValidade = itemEstoque.DataValidade,
                        NFe = itemEstoque.NFe,
                        DataHoraCriacao = DateTime.UtcNow
                    };

                    produtoExistente.ItensEstoque ??= new List<ItemEstoqueModel>();
                    produtoExistente.ItensEstoque.Add(novoLote);
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

        public async Task<ItemComEstoqueListaPaginadaDTO<ProdutosLeituraDTO>> BuscarPaginadoAsync(
            ProdutosFiltro filtro,
            ItensPaginationParameters paginationParameters,
            CancellationToken cancellationToken = default)
        {
            var diasDataLimiteVencimento = _configuration.GetValue("RegrasDeNegocio:DiasDataLimiteVencimentoItens", 30);

            var consulta = await _repository.ConsultarPaginadoAsync(filtro, paginationParameters, diasDataLimiteVencimento, cancellationToken);

            var pageNumber = Math.Max(paginationParameters.PageNumber, 1);
            var pageSize = paginationParameters.PageSize;
            var totalPages = consulta.TotalCount == 0
                ? 0
                : (int)Math.Ceiling(consulta.TotalCount / (double)pageSize);

            return new ItemComEstoqueListaPaginadaDTO<ProdutosLeituraDTO>
            {
                Items = consulta.Items.Select(p => (ProdutosLeituraDTO)p).ToList(),
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