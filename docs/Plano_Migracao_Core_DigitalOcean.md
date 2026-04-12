# Plano de migração do core para a nuvem DigitalOcean

Este documento relaciona a [referência da API DigitalOcean](https://docs.digitalocean.com/reference/api/reference/) ao desenho atual do **CanilApp** e propõe um roteiro de migração, riscos e estimativa de esforço para **dois desenvolvedores júnior**.

---

## 1. O que a documentação da API DigitalOcean cobre (e o que não cobre)

A API documentada em `https://docs.digitalocean.com/reference/api/reference/` é a **API de controle (control plane)** da plataforma: criação e gestão de recursos como **Droplets**, **App Platform** (`Apps`), **bancos gerenciados** (`Databases`), **Spaces** (objetos compatíveis com S3), **Load Balancers**, **VPCs**, **Kubernetes**, **Container Registry**, certificados, firewalls, entre outros. Ela expõe padrões REST (`GET`/`POST`/`PUT`/`PATCH`/`DELETE`), JSON, autenticação por token Bearer, paginação, **rate limits** (por exemplo, 5.000 requisições/hora e limite de rajada por minuto) e respostas de erro padronizadas.

**Implicação para o projeto:** em geral vocês **não** embutem chamadas a essa API dentro do aplicativo final dos usuários. Ela serve para **automatizar infraestrutura** (scripts, `doctl`, Terraform, pipelines CI/CD). O “core” do produto continua sendo a API .NET, o banco e a sincronização; na DO isso roda **sobre** os produtos que a API ajuda a provisionar.

---

## 2. Panorama do core atual (repositório CanilApp)

Com base no backend atual:

| Camada | Tecnologia atual | Observação para nuvem |
|--------|------------------|------------------------|
| API | ASP.NET Core 8 (Kestrel) | Adequado para App Platform, Droplet com Docker ou Kubernetes. |
| Dados locais | SQLite (`%LocalAppData%/CanilApp/canilapp.db`) + EF Core | Arquivo único em disco **não** é ideal para ambiente escalável/multi-instância; tende a exigir **banco gerenciado** (PostgreSQL/MySQL na DO). |
| Autenticação | JWT validado contra **Amazon Cognito** | DigitalOcean **não** oferece substituto nativo 1:1 ao Cognito. |
| Sincronização / nuvem de dados | **Amazon DynamoDB** com credenciais federadas via **Cognito Identity Pool** + token do usuário | DigitalOcean **não** possui serviço equivalente ao DynamoDB. |
| CORS | Política restrita a localhost e redes privadas | Precisará de política explícita para origens do app (ou gateway) em produção. |
| Host desktop | Frontend MAUI inicia o backend localmente (`backend.json`, porta dinâmica) | Versão “cloud” exige URL estável (HTTPS), remoção ou bifurcação do fluxo de *discovery* local. |

Conclusão: migrar “o core para a DO” é, na prática, **hospedar a API e o banco relacional na DigitalOcean** e **decidir o destino do stack AWS** (manter híbrido ou reimplementar).

---

## 3. Arquiteturas alvo possíveis na DigitalOcean

### 3.1 Opção A — Híbrida (menor mudança de código)

- **API:** App Platform ou Droplet + container .NET.
- **Banco relacional:** DO Managed PostgreSQL ou MySQL (substituir SQLite).
- **Auth + dados de sync:** **permanecem** Cognito + DynamoDB na AWS.

**Prós:** Menor risco; time júnior foca em deploy, connection strings, CORS e EF.  
**Contras:** Dois provedores; latência entre regiões se mal escolhida; custo e compliance divididos.

### 3.2 Opção B — “Tudo na DO” (maior escopo)

- **API:** mesma da opção A.
- **Banco relacional:** gerenciado na DO.
- **Substituir DynamoDB:** modelo relacional adicional, ou outro store (por exemplo tabelas no Postgres, fila + workers, ou serviço externo ainda não nativo DO).
- **Substituir Cognito:** Auth0, Clerk, Supabase Auth, ou JWT próprio com gestão de usuários no Postgres — todos exigem **mudança no frontend e backend**.

**Prós:** Um painel de faturamento e rede (VPC) mais simples de raciocinar.  
**Contras:** **Reengenharia** de sync e login; maior tempo e risco de regressão.

### 3.3 Opção C — Kubernetes na DO (DOKS)

- Adequado se já houver necessidade de orquestração, múltiplos serviços e escala agressiva.  
- Para dois júnior sem experiência em K8s, costuma **atrasar** o primeiro go-live.

**Recomendação inicial:** Opção **A** ou **B parcial** (DO para API + Postgres, AWS só para auth/sync até segunda fase).

---

## 4. Mapeamento API DigitalOcean → tarefas de infraestrutura

Endpoints e famílias úteis do ponto de vista de **provisionamento** (via API, `doctl` ou Terraform):

| Área na documentação | Uso típico no projeto |
|----------------------|------------------------|
| `Apps` | Definir build/deploy da API .NET (App Platform), variáveis de ambiente, domínio. |
| `Databases` | Criar cluster PostgreSQL/MySQL, usuários, connection string. |
| `Projects` / `Project Resources` | Organizar recursos por ambiente (dev/staging/prod). |
| `VPCs` | Isolar API e banco na mesma VPC quando aplicável. |
| `Firewalls` | Restringir tráfego ao Droplet, se não usar só App Platform gerenciado. |
| `Certificates` | TLS para domínios customizados. |
| `Spaces` + API compatível S3 | Artefatos, backups, exportações — **não** substitui DynamoDB sem redesign. |
| `Container Registry` + `Droplets` / `Kubernetes` | Se a estratégia for imagem Docker em vez de build nativo App Platform. |

**Rate limits:** automações que criam/destróiem muitos recursos em loop devem respeitar cabeçalhos `ratelimit-*` e `retry-after` em `429`, conforme a própria referência.

---

## 5. Plano por fases (estruturado)

### Fase 0 — Descoberta e decisões (1–2 semanas)

- Definir **Opção A vs B** (híbrido vs sair do AWS).
- Escolher região única (ex.: próxima aos usuários) para API + banco gerenciado.
- Listar variáveis secretas (Cognito, futura connection string, chaves de API).
- Desenhar diagrama: cliente MAUI → HTTPS → API → Postgres (+ AWS se híbrido).

### Fase 1 — Banco gerenciado e EF Core

- Criar instância **Managed Database** na DO (Postgres recomendado para ecossistema .NET).
- Adicionar provider **Npgsql** (ou Pomelo para MySQL), migrar de `UseSqlite` para connection string de ambiente.
- Rodar migrations EF em ambiente controlado; validar dados e índices.
- **Desafio júnior:** diferenças SQL (tipos, constraints), ambientes dev/staging, backups e restore.

### Fase 2 — Containerização ou App Platform

- Dockerfile multi-stage para a API ou uso do buildpack do App Platform.
- Configurar health check (`/api/health` já existe).
- Variáveis de ambiente para `AWS:*` (se híbrido) e `ConnectionStrings:*`.
- Pipeline (GitHub Actions ou similar) que chama **API DO / `doctl`** ou Terraform para deploy idempotente.

### Fase 3 — Segurança e rede

- HTTPS obrigatório na borda (App Platform ou Load Balancer + certificado).
- CORS: substituir “localhost only” por política baseada em configuração (domínios permitidos).
- Revisar rate limiting já existente para IP/usuário em ambiente público.
- Segredos fora do repositório (Secrets do App Platform ou vault).

### Fase 4 — Cliente MAUI

- Modo “cloud”: URL base configurável (produção) vs modo local (atual).
- Ajustar `BackendStarter` / discovery para não depender de processo local quando em cloud.
- Testes em dispositivos reais com rede móvel e certificados.

### Fase 5 (opcional / segunda onda) — Saída do AWS

- Redesenhar **SyncService** e contratos se DynamoDB for abolido.
- Novo provedor de identidade e emissão de JWT; alinhar `JwtBearer` e fluxo de login no app.

### Fase 6 — Operação

- Logs: stdout para plataforma ou sink centralizado (evitar apenas arquivo em disco efêmero).
- Monitoramento (Uptime na DO, alertas).
- Runbooks: rollback, rotação de segredos, dimensionamento do banco.

---

## 6. Principais desafios para o time

1. **SQLite → Postgres/MySQL:** migrations, concorrência, tipos e possível necessidade de dados de transição.  
2. **Cognito + Identity Pool + DynamoDB:** modelo mental AWS é específico; júnior precisa de mentoria para não quebrar segurança (tokens, escopos, IAM efetivo).  
3. **Ausência de DynamoDB na DO:** “migrar tudo para DO” implica **nova modelagem** de sync, não só “apontar endpoint”.  
4. **Dois ambientes de execução:** desktop com backend embutido vs só cliente falando com API remota — duplicação de testes e configuração.  
5. **Infra como código:** API da DO é poderosa, mas erros de permissão de token, paginação e rate limit geram debugging pouco familiar para júnior.  
6. **Custos e sizing:** banco gerenciado + tráfego; sem dimensionamento inicial claro, pode haver surpresa na fatura.  
7. **Conformidade e LGPD:** localização de dados (região DO) vs dados ainda na AWS se híbrido.

---

## 7. Estimativa de tempo — dois desenvolvedores júnior

Premissas: mentoria pontual de alguém sênior em cloud/SQL; escopo **Opção A (híbrida)**; sem reescrita completa de auth/sync.

| Cenário | Prazo indicativo (calendário) | Observação |
|---------|-------------------------------|------------|
| **Mínimo viável** (API na DO + Postgres + deploy manual razoável + MAUI apontando para URL fixa; Cognito+DynamoDB mantidos) | **6–10 semanas** | Inclui aprendizado, erros de primeira viagem e testes. |
| **Robusto** (CI/CD, ambientes dev/staging, observabilidade, hardening CORS/secrets) | **10–16 semanas** | Paraleliza bem com 2 pessoas após Fase 0. |
| **Opção B (tirar DynamoDB e/ou Cognito)** | **+3–6 meses** além do híbrido | Fortemente dependente do desenho do sync e do novo IdP; alta incerteza para júnior sem arquitetura guiada. |

Fatores que **alongam** a faixa superior: pouca mentoria, primeira vez com Docker/App Platform, dados reais complexos na migração SQLite, ou exigência de alta disponibilidade desde o dia um.

Fatores que **encurtam**: uso massivo de App Platform gerenciado, poucos dados a migrar, manter AWS para sync/auth, e um ambiente de staging clonado cedo no projeto.

---

## 8. Entregáveis sugeridos ao final da primeira onda (híbrido)

- API publicada na DigitalOcean com HTTPS.
- Banco gerenciado alimentado por EF Core (sem SQLite em produção).
- Documentação interna: variáveis de ambiente, como fazer deploy e rollback.
- Cliente MAUI com configuração de endpoint de produção validada em teste.
- Lista de débitos técnicos explícita se AWS permanecer (fase 2 estratégica).

---

## 9. Referências

- [DigitalOcean API Reference](https://docs.digitalocean.com/reference/api/reference/) — visão geral, autenticação, rate limits e catálogo de endpoints.
- Índice para agentes/LLMs: [https://docs.digitalocean.com/llms.txt](https://docs.digitalocean.com/llms.txt) (conforme nota na documentação).

---

*Documento gerado para alinhamento de equipe; ajustar datas após definir opção arquitetural (A/B) e disponibilidade de mentoria técnica.*
