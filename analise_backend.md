# Análise de backend — CanilApp (ASP.NET Core 8 + EF Core + SQLite)

## Visão Geral

O backend é uma API **monolítica** em **.NET 8**, com **camadas** reconhecíveis (Controllers → Services → Repositories → `CanilAppDbContext`), **autenticação JWT** com **refresh token** opaco persistido em SQLite, **BCrypt** para senhas, **Serilog** (console + ficheiro rotativo), **CORS** configurável, **ForwardedHeaders** para proxy (Nginx), **rate limiting** apenas na rota de sync, **Swagger** condicionado a desenvolvimento e **migrations aplicadas no arranque**.

Para o volume indicado (**~30 utilizadores/dia**, uso disperso em **~8 h/dia**), a arquitetura e a tecnologia escolhida são **adequadas**: o limite natural é o **SQLite** (escrita essencialmente **sequencial**, um ficheiro no disco), não a quantidade de utilizadores em si. Produção exige sobretudo **configuração segura**, **backup do `.db`**, **observabilidade mínima** e correção de **alguns detalhes de API/segurança** listados abaixo — sem necessidade de Redis, filas ou microserviços para este perfil de carga.

---

## Problemas Encontrados

### Segurança

- **Prioridade:** Alta  
- **Problema:** O endpoint `POST /api/Usuarios` **cria utilizadores sem `[Authorize]`** e aceita `Permissao` no corpo (`UsuarioRequestDTO`). Qualquer cliente pode registar contas e, em princípio, **elevar privilégios** se o enum permitir níveis acima de leitura.  
- **Impacto:** Abuso de registo, contas não autorizadas, possível **escalação de permissões** conforme valores do enum.  
- **Solução recomendada:** Proteger criação de utilizadores com **JWT + política por role** (só administrador), ou fluxo de **convite/onboarding** controlado; **ignorar** `Permissao` vindos de anónimos e fixar `LEITURA` até validação administrativa. Exemplo de intenção: `[Authorize(Policy = "Admin")]` no `Create` e validação no serviço.

- **Prioridade:** Alta  
- **Problema:** O **refresh token** é armazenado **em claro** na tabela `Usuarios` e o login devolve o token opaco ao cliente.  
- **Impacto:** Exposição de base de dados (cópia, backup mal guardado, SQL injection futura) permite **reutilização de sessões**.  
- **Solução recomendada:** Guardar **hash** do refresh token (ex.: SHA-256 do valor) e comparar com `Verify`; rotacionar e invalidar tokens antigos de forma explícita. Manter prazo de expiração (já existe `DataHoraExpiracaoRefreshToken`).

- **Prioridade:** Média  
- **Problema:** O handler global de exceções devolve **`feature.Error.Message`** no JSON de resposta **500**.  
- **Impacto:** **Vazamento de informação** (mensagens internas, caminhos, detalhes de EF/SQLite) para o cliente em produção.  
- **Solução recomendada:** Em produção, resposta genérica (`"Ocorreu um erro interno"`) + **correlation ID** no log; mensagem detalhada só em `Development` ou atrás de flag de configuração.

- **Prioridade:** Média  
- **Problema:** Existe **claim `permissao`** no JWT, mas os controladores usam apenas **`[Authorize]`** genérico — **não há separação por perfil** nas rotas de negócio.  
- **Impacto:** Qualquer utilizador autenticado acede a todas as operações (CRUD estoque, produtos, etc.), independentemente da permissão no token/base.  
- **Solução recomendada:** Políticas ASP.NET Core (`AddAuthorization` + `RequireClaim("permissao", "ADMIN")` ou equivalente) alinhadas a `PermissoesEnum`.

- **Prioridade:** Média  
- **Problema:** Não há **índice único** em `Usuarios.Email` na migration inicial; duplicados dependem só da lógica da aplicação.  
- **Impacto:** Condição de corrida ou bug futuro pode criar **emails duplicados** na base.  
- **Solução recomendada:** Migration com `CreateIndex` único em `Email` (e tratamento de `DbUpdateException` com 409 Conflict).

- **Prioridade:** Baixa  
- **Problema:** `LoginController` regista o **login** em log (`LogInformation` com identificador do utilizador).  
- **Impacto:** **PII** em ficheiros de log; retenção 30 dias amplifica exposição.  
- **Solução recomendada:** Logar apenas **hash parcial** do email ou ID interno após autenticação bem-sucedida; política de retenção/mascaramento.

### API / REST e validação

- **Prioridade:** Alta  
- **Problema:** Em `RetiradaEstoqueController.Create`, `CreatedAtAction(dto.CodItem, dto)` usa **`dto.CodItem` como nome de ação** — não corresponde a nenhuma action; a semântica de **201 Created** e **Location** fica incorreta.  
- **Impacto:** Clientes ou proxies que dependam de headers/links quebram; comportamento confuso para manutenção.  
- **Solução recomendada:** `return CreatedAtAction(nameof(GetById), new { id = ... }, dto);` (exige action `GET` por id se ainda não existir) ou `return Ok(...)` com código explícito se não houver GET.

- **Prioridade:** Média  
- **Problema:** `EstoqueController`: `HttpPut("{lote}")` **não recebe `lote` da rota** no método `Put` — só o body. Rota enganosa e risco de atualizar o registo errado se o body não coincidir com o URL.  
- **Impacto:** Erros de integração, **inconsistência REST**, superfície para uso incorreto da API.  
- **Solução recomendada:** Assinatura `Put(string lote, ItemEstoqueDTO dto)` e validar `dto.Lote == lote` (ou usar só a rota).

- **Prioridade:** Média  
- **Problema:** Respostas de erro **inconsistentes** (`ErrorResponse` vs `new { error = ... }` em `UsuariosController`), e alguns `500` **sem corpo** (`return StatusCode(500)` em `ProdutosController`).  
- **Impacto:** Frontend e integrações mais difíceis; debugging inconsistente.  
- **Solução recomendada:** Filtro de exceção ou middleware que normalize **ProblemDetails** / `ErrorResponse` único.

- **Prioridade:** Baixa  
- **Problema:** Poucos DTOs usam **`[ApiController]` + validação automática** de forma uniforme; parte da validação está em serviços com exceções personalizadas.  
- **Impacto:** Mensagens e códigos **400** nem sempre alinhados com dados inválidos detectados cedo.  
- **Solução recomendada:** `DataAnnotations` ou FluentValidation nos DTOs públicos; confiar em `ModelState` onde fizer sentido.

### Base de dados e performance

- **Prioridade:** Média  
- **Problema:** `EstoqueItemRepository.GetByIdAsync(int id)` usa `FirstOrDefaultAsync(i => i.IdItem == id)`, mas a chave primária é **composta (`IdItem`, `Lote`)**.  
- **Impacto:** Vários lotes para o mesmo item → devolução **não determinística** de um único registo; bugs silenciosos em leitura/atualização.  
- **Impacto adicional:** `DeleteAsync(string lote)` apaga por **lote só**, ambíguo se o mesmo lote existir em teorias diferentes de modelo (hoje o PK composto mitiga parcialmente, mas o delete ignora `IdItem`).  
- **Solução recomendada:** Métodos `GetAsync(idItem, lote)`, `DeleteAsync(idItem, lote)` e rotas alinhadas à chave real.

- **Prioridade:** Média  
- **Problema:** `InsumosRepository.GetAsync(InsumosFiltroDTO)` não aplica **`IsDeleted == false`** no mesmo critério usado noutros métodos da entidade.  
- **Impacto:** Listagens filtradas podem incluir **insumos soft-deleted**.  
- **Solução recomendada:** `.Where(i => !i.IsDeleted)` na query base do filtro.

- **Prioridade:** Baixa  
- **Problema:** Listagens (`GetAsync` em produtos/medicamentos/insumos) fazem **`Include` de coleções completas** sem **paginação** nem projeção (`Select`) para DTO na base.  
- **Impacto:** Com crescimento de dados e lotes, **memória** e tempo de resposta aumentam; para ~30 utilizadores/dia e inventário pequeno, risco **baixo** a curto prazo.  
- **Solução recomendada:** Paginação (`Skip`/`Take`), limite máximo de página e projeção quando o payload for grande.

- **Prioridade:** Baixa  
- **Problema:** Filtros com `Contains` em vários campos sem índices compostos específicos (SQLite limita ganhos); `Any` sobre `ItensEstoque` pode gerar SQL pesado.  
- **Impacto:** Com volume maior de linhas em `ItensEstoque`, consultas mais lentas.  
- **Solução recomendada:** Índices em colunas filtradas frequentemente (`CodProduto`, `CodMedicamento`, `NFe` se usado, etc.) após medição; evitar over-indexing sem necessidade.

- **Prioridade:** Baixa (concorrência / estoque)  
- **Problema:** Operações de atualização de quantidade em estoque **não mostram** transação explícita nem estratégia de **concorrência otimista** (tokens de linha/versionamento).  
- **Impacto:** Com dois pedidos simultâneos raros, **perda de atualização** (last write wins). Com ~30 utilizadores/dia, probabilidade baixa mas não zero em picos.  
- **Solução recomendada:** Para evolução futura, `RowVersion` ou transação + leitura consistente; aceitar risco atual se o domínio tolerar.

### Arquitetura e prontidão para produção

- **Prioridade:** Média  
- **Problema:** **`Database.Migrate()` no arranque** de cada instância.  
- **Impacto:** Com **uma única instância** + SQLite (cenário actual), é aceitável; com **várias instâncias** ou deploy blue/green, **corrida** na aplicação de migrations e locks no ficheiro.  
- **Solução recomendada:** Manter migrate no arranque só para **ambiente único**; em evolução, **job de release** (`dotnet ef database update`) separado do processo web.

- **Prioridade:** Média  
- **Problema:** Não existe **pipeline CI/CD** no repositório (apenas `.github/CODEOWNERS`); não há testes automatizados visíveis no fluxo.  
- **Impacto:** Regressões e builds quebrados só descobertos manualmente.  
- **Solução recomendada:** Workflow GitHub Actions mínimo: `dotnet restore`, `dotnet build`, `dotnet test` (mesmo que poucos testes), opcionalmente análise estática.

- **Prioridade:** Baixa  
- **Problema:** `GET /api/health` devolve apenas `"OK"` **sem verificar** ligação à base ou disco do SQLite.  
- **Impacto:** Load balancers e monitorização podem considerar o processo “saudável” com base **corrompida** ou só de leitura com falha.  
- **Solução recomendada:** Health checks ASP.NET Core com `DbContext` (`CanDatabaseConnect` ou query trivial).

### Escalabilidade e estado

- **Prioridade:** Média (contexto SQLite)  
- **Problema:** **SQLite** + ficheiro local **impede escala horizontal** clássica (várias réplicas de escrita no mesmo ficheiro).  
- **Impacto:** Segunda instância da API a apontar ao mesmo `.db` em rede partilhada **não é** padrão suportado de forma robusta.  
- **Solução recomendada:** Para o volume actual, **uma instância** + **backup** é suficiente; se no futuro precisar de réplicas, migrar para **PostgreSQL**/serviço gerido.

- **Prioridade:** Baixa  
- **Problema:** API **stateless** em memória de sessão (bom); rate limit por **valor bruto do header Authorization** particiona por string longa (JWT).  
- **Impacto:** Overhead trivial de hashing de chave; sem impacto relevante a 30 utilizadores/dia.  
- **Solução recomendada:** Particionar por **sub do JWT** ou IP após autenticação, se políticas de limite forem alargadas.

### Concorrência e async

- **Prioridade:** Baixa  
- **Problema:** Uso de `Console.WriteLine` em `ProdutosController` (caminho de execução normal).  
- **Impacto:** Ruído em stdout, não estruturado, irrelevante para observabilidade profissional.  
- **Solução recomendada:** Remover ou substituir por `ILogger` com nível `Debug`.

- **Prioridade:** Baixa  
- **Problema:** Não foram encontrados anti-padrões **`Wait()` / `.Result`** no backend (bom).  
- **Impacto:** —  
- **Solução recomendada:** Manter o padrão atual `async`/`await` end-to-end.

### Logging e observabilidade

- **Prioridade:** Média  
- **Problema:** Logs em ficheiro local sem **correlação de pedido**, métricas ou agregação central (ELK, Grafana Loki, Application Insights, etc.).  
- **Impacto:** Diagnosticar incidentes em produção exige **SSH ao servidor**; sem alertas.  
- **Solução recomendada:** Para o escopo do projeto: **rotação** (já existe), **níveis por ambiente**, e opcionalmente um sink cloud ou export OpenTelemetry se o orçamento/tempo permitir.

- **Prioridade:** Baixa  
- **Problema:** Rate limiting aplicado só à política **`sync-policy`**.  
- **Impacto:** `POST /api/Login` sem limite específico → **força bruta** teoricamente possível (mitigável também no Nginx `limit_req`).  
- **Solução recomendada:** Política de limite por IP no login e/ou no reverse proxy.

### Deploy e segredos

- **Prioridade:** Média  
- **Problema:** Segredos dependem de **`appsettings`** / variáveis de ambiente documentadas, mas não há **validação de configuração** centralizada (ex.: `IOptions` com `ValidateOnStart`).  
- **Impacto:** Arranque com JWT fraco ou CORS vazio em produção pode cair em política **permissiva** (`AllowAnyOrigin` sem credenciais quando não há origens configuradas).  
- **Solução recomendada:** Em `Production`, **falhar o arranque** se `Cors:AllowedOrigins` estiver vazio ou JWT inválido; usar **User Secrets** / DO App Platform / variáveis do systemd conforme já referido no README.

- **Prioridade:** Baixa  
- **Problema:** Documentação de deploy existe (`docs/Deploy_DigitalOcean.md`), mas **automatização** (scripts, systemd unit no repo) pode estar só na doc.  
- **Impacto:** Procedimento manual propenso a erros humanos.  
- **Solução recomendada:** Versionar **unit file** de exemplo e checklist de variáveis de ambiente.

---

## Pontos Positivos

- **.NET 8** e pacotes recentes de **EF Core** e **JWT** com validação de issuer, audience, lifetime e **clock skew** controlado.  
- **BCrypt** para hashing de senhas e verificação explícita de comprimento mínimo do segredo JWT (≥ 32 caracteres).  
- **Serilog** com consola + ficheiro diário e retenção limitada; override de verbosidade Microsoft.  
- **CORS** com lista explícita em produção quando configurada; desenvolvimento flexível para LAN.  
- **ForwardedHeaders** preparado para **HTTPS terminado no Nginx** e IP real do cliente.  
- **SqliteConnectionResolver** para caminhos absolutos e criação de diretório de dados (evita falhas por **cwd** no Linux/systemd).  
- **Separação** em repositórios e serviços, **soft delete** coerente na maior parte das entidades de catálogo, **Includes** explícitos reduzindo risco de N+1 nas listagens principais.  
- **Rate limiting** presente onde havia risco de abuso histórico (sync).  
- **README** e guia de **DigitalOcean** com boas práticas (disco persistente, backup do `.db`, não commitar segredos).

---

## Recomendações Prioritárias

1. **Proteger** `POST /api/Usuarios` e **impedir escalação de permissão** por utilizadores anónimos (política admin + default de permissão).  
2. **Persistir refresh token como hash** e rever o fluxo de rotação.  
3. Corrigir **`CreatedAtAction`** em `RetiradaEstoqueController` e alinhar **PUT de estoque** com o parâmetro `lote` da rota.  
4. Ajustar **`GetById` / delete de estoque** para chave composta **`(IdItem, Lote)`** e revisar ambiguidade de delete só por lote.  
5. Endurecer respostas **500** (sem mensagem interna ao cliente) + identificador de correlação nos logs.  
6. Introduzir **autorização por permissão** (policies) coerente com o claim `permissao` do JWT.  
7. Adicionar **índice único** em `Usuarios.Email` e corrigir filtro **`IsDeleted`** em `InsumosRepository.GetAsync(filtro)`.  
8. **Health check** com ping à base; **CI** mínimo (`build` + `test`); reforçar validação de configuração em **Production**.  
9. **Rate limit** ou limite no proxy para **login**; opcional: remover `Console.WriteLine` do `ProdutosController`.  

Para o volume de **30 utilizadores/dia**, **não** é necessário introduzir Redis, filas ou múltiplas instâncias da API com SQLite; o foco deve ser **segurança de contas e tokens**, **consistência da API de estoque**, **mensagens de erro seguras** e **operações de backup/monitorização** leves.
