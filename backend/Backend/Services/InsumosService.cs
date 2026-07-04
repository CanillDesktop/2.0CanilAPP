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
        private readonly IUnidadeEstoqueContextService _unidadeContext;
        private readonly IUnidadeMedidaService _unidadeMedidaService;
        private readonly IConfiguration _configuration;

        public InsumosService(
            IInsumosRepository repository,
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

        private static void ValidarCamposObrigatorios(InsumosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.DescricaoSimplificada)
                || string.IsNullOrWhiteSpace(model.DescricaoDetalhada)
                || model.Unidade <= 0)
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }
        }

        public async Task<IEnumerable<InsumosModel>> BuscarTodosAsync() => await _repository.GetAsync();

        public async Task<InsumosModel?> BuscarPorIdAsync(int id) => (await _repository.GetByIdAsync(id))!;

        public async Task<InsumosModel?> CriarAsync(InsumosModel model)
        {
            ValidarCamposObrigatorios(model);
            await _unidadeMedidaService.GarantirAplicavelAsync(model.Unidade, TipoItemUnidadeMedida.Insumo);

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

        public async Task<InsumosModel?> AtualizarAsync(int id, InsumosModel model)
        {
            try
            {
                var insumoExistente = await _repository.GetByIdAsync(id);

                if (insumoExistente == null)
                {
                    throw new ArgumentNullException(null, $"Insumo de id {id} não encontrado");
                }

                ValidarCamposObrigatorios(model);
                await _unidadeMedidaService.GarantirAplicavelAsync(model.Unidade, TipoItemUnidadeMedida.Insumo);

                var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
                await _unidadeContext.GarantirConsultaAsync(idUnidade);

                insumoExistente.DescricaoSimplificada = model.DescricaoSimplificada;
                insumoExistente.DescricaoDetalhada = model.DescricaoDetalhada;
                insumoExistente.Unidade = model.Unidade;

                var nivelInformado = model.ItensNivelEstoque.FirstOrDefault()?.NivelMinimoEstoque;
                if (nivelInformado is int minimo)
                {
                    var nivelExistente = insumoExistente.ObterNivelEstoque(idUnidade);
                    if (nivelExistente is null)
                    {
                        insumoExistente.ItensNivelEstoque.Add(new ItemNivelEstoqueModel
                        {
                            Id = insumoExistente.Id,
                            IdUnidadeEstoque = idUnidade,
                            NivelMinimoEstoque = minimo,
                        });
                    }
                    else
                    {
                        nivelExistente.NivelMinimoEstoque = minimo;
                    }
                }

                insumoExistente.DataHoraAtualizacao = DateTime.UtcNow;
                insumoExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                return await _repository.UpdateAsync(insumoExistente);
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
                throw;
            }
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var editor = _userSessionService.EditedBy ?? string.Empty;
            return await _repository.DeleteNaUnidadeAtivaAsync(id, editor);
        }

        public async Task<ItemComEstoqueListaPaginadaDTO<InsumosLeituraDTO>> BuscarPaginadoAsync(
            InsumosFiltro filtro,
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
