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
        private readonly IUnidadeEstoqueContextService _unidadeContext;
        private readonly IUnidadeMedidaService _unidadeMedidaService;
        private readonly IConfiguration _configuration;

        public ProdutosService(
            IProdutosRepository repository,
            IUserSessionService userSessionService,
            IUnidadeEstoqueContextService unidadeContext,
            IUnidadeMedidaService unidadeMedidaService,
            IConfiguration configuration)
        {
            _repository = repository;
            _userSessionService = userSessionService;
            _unidadeContext = unidadeContext;
            _unidadeMedidaService = unidadeMedidaService;
            _configuration = configuration;
        }

        private static void ValidarCamposObrigatorios(ProdutosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.DescricaoSimples)
                || string.IsNullOrWhiteSpace(model.DescricaoDetalhada)
                || model.Unidade <= 0
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
            await _unidadeMedidaService.GarantirAplicavelAsync(model.Unidade, TipoItemUnidadeMedida.Produto);

            model.ItensEstoque = [];
            var nivelMinimo = model.ItensNivelEstoque.FirstOrDefault()?.NivelMinimoEstoque ?? 0;
            model.ItensNivelEstoque = [];

            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            // Presença na unidade ativa (mesmo com nível 0): cadastro não afeta outras unidades.
            model.ItensNivelEstoque.Add(new ItemNivelEstoqueModel
            {
                IdUnidadeEstoque = idUnidade,
                NivelMinimoEstoque = nivelMinimo,
            });

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
                await _unidadeMedidaService.GarantirAplicavelAsync(model.Unidade, TipoItemUnidadeMedida.Produto);

                var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
                await _unidadeContext.GarantirConsultaAsync(idUnidade);

                produtoExistente.DescricaoSimples = model.DescricaoSimples;
                produtoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                produtoExistente.Unidade = model.Unidade;
                produtoExistente.Categoria = model.Categoria;

                var nivelInformado = model.ItensNivelEstoque.FirstOrDefault()?.NivelMinimoEstoque;
                if (nivelInformado is int minimo)
                {
                    var nivelExistente = produtoExistente.ObterNivelEstoque(idUnidade);
                    if (nivelExistente is null)
                    {
                        produtoExistente.ItensNivelEstoque.Add(new ItemNivelEstoqueModel
                        {
                            Id = produtoExistente.Id,
                            IdUnidadeEstoque = idUnidade,
                            NivelMinimoEstoque = minimo,
                        });
                    }
                    else
                    {
                        nivelExistente.NivelMinimoEstoque = minimo;
                    }
                }

                produtoExistente.DataHoraAtualizacao = DateTime.UtcNow;
                produtoExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                return await _repository.UpdateAsync(produtoExistente);
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
            var editor = _userSessionService.EditedBy ?? string.Empty;
            return await _repository.DeleteNaUnidadeAtivaAsync(id, editor);
        }

        public async Task<ItemComEstoqueListaPaginadaDTO<ProdutosLeituraDTO>> BuscarPaginadoAsync(
            ProdutosFiltro filtro,
            EstoqueConsultaParameters paginationParameters,
            CancellationToken cancellationToken = default)
        {
            ValidarOrdenacao(paginationParameters);

            var diasDataLimiteVencimento = _configuration.GetValue("RegrasDeNegocio:DiasDataLimiteVencimentoItens", 30);

            var consulta = await _repository.ConsultarPaginadoAsync(filtro, paginationParameters, diasDataLimiteVencimento, cancellationToken);

            var pageNumber = Math.Max(paginationParameters.NormalizedPageNumber, 1);
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

        private static readonly HashSet<string> OrderByPermitidos = new(StringComparer.OrdinalIgnoreCase)
        {
            "codigo", "nome", "categoria", "quantidade", "status", "ultimamovimentacao",
        };

        private static void ValidarOrdenacao(EstoqueConsultaParameters parameters)
        {
            if (!OrderByPermitidos.Contains(parameters.NormalizedOrderBy))
            {
                throw new ArgumentException(
                    "Campo de ordenação inválido. Valores: codigo, nome, categoria, quantidade, status, ultimaMovimentacao.",
                    nameof(parameters));
            }
        }
    }
}
