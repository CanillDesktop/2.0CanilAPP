# Onboarding — CanipApp (projeto completo)

Este documento resume **para que existe o projeto**, **com que tecnologias é construído**, **o que o sistema permite fazer** no dia a dia e **como arrancar** API e frontend no teu ambiente. Para detalhe só de UI e chamadas HTTP, vê também [docs/frontend-onboarding.md](docs/frontend-onboarding.md).

---

## 1. Propósito

**CanipApp** é um sistema web para **gestão integrada de estoque e cadastros** no contexto da **Secretaria do Bem-Estar Animal / canil**: medicamentos, produtos gerais, insumos, movimentações (lotes, retiradas) e **utilizadores** com papéis e permissões.

Objetivos centrais:

- Substituir processos dispersos (planilhas ou aplicação antiga tipo executável) por uma **SPA** moderna ligada a uma **API REST** centralizada, versionada em Git e preparada para deploy (por exemplo na DigitalOcean).
- Garantir **persistência relacional** (SQLite na fase atual), **autenticação JWT** e contratos API documentados (Swagger/OpenAPI).
- Oferecer interface **responsiva** para cadastro, consulta e operações de estoque no terreno institucional.

Projeto académico (**PIEX** — Análise e Desenvolvimento de Sistemas), em monorepo com backend .NET e frontend React.

---

## 2. Stacks e arquitetura

### Backend (`backend/Backend`)

| Área | Tecnologia |
|------|------------|
| Runtime | **.NET 8** |
| API | **ASP.NET Core** Web API |
| Dados | **Entity Framework Core 8** + **SQLite** |
| Auth | **JWT** (`JwtBearer`), passwords com **BCrypt** |
| Documentação API | **Swashbuckle** / OpenAPI (Swagger UI) |
| Logs | **Serilog** (consola + ficheiro) |

Biblioteca partilhada: **`backend/Shared`** — DTOs, enums e modelos alinhados entre API e conceitos do frontend.

### Frontend (`frontend/`)

| Área | Tecnologia |
|------|------------|
| UI | **React 19**, **TypeScript** |
| Build | **Vite 8** |
| Componentes | **MUI 9** (@mui/material), **Emotion** |
| HTTP | **Axios** |
| Rotas | **React Router DOM 7** |

Em desenvolvimento, o Vite faz **proxy** de `/api` para o backend (`VITE_DEV_API_PROXY_TARGET`, por omissão `http://localhost:5000`), evitando problemas de CORS.

### Infraestrutura e deploy

- Variáveis sensíveis **fora do Git** (`appsettings.json`, `frontend/.env`).
- Guias em `docs/` para **DigitalOcean**, **nginx**, **systemd**, SQLite em caminho persistente em produção.

---

## 3. Principais ações do sistema

Funcionalidades organizadas por **domínio** (pastas em `frontend/src/domains/` e endpoints correspondentes na API).

| Domínio | O que o utilizador faz |
|---------|-------------------------|
| **Autenticação** | Login, sessão JWT, refresh onde aplicável, logout; página de detalhe da sessão. |
| **Utilizadores** | Listagem; cadastro de novos utilizadores (fluxos administrativos conforme papéis); gestão alinhada à API de perfis/permissões. |
| **Produtos** | Listagem com filtros (evolução do projeto), criar/editar produto, detalhe com informação de lotes associados. |
| **Medicamentos** | CRUD e listagem específica do domínio medicamentos (contrato próprio na API). |
| **Insumos** | CRUD de insumos (listagem, formulários, detalhe). |
| **Estoque** | Painel **dashboard** (KPIs, alertas, visão geral); listagem de estoque; detalhe de item; **novo lote**; **retirada de estoque**; navegação por categorias onde existir na UI. |
| **Sincronização** *(se ativo no cliente)* | Serviços/API de sincronização conforme evolução do backend — validar no Swagger e em `domains/sincronizacao/`. |

Rotas principais da SPA (referência em `frontend/src/app/routes/RotasApp.tsx`):

- Públicas / entrada: `/login`, `/cadastro`
- Autenticadas: `/dashboard`, `/produtos`, `/medicamentos`, `/insumos`, `/estoque`, `/usuarios`, `/sessao`
- Operações de estoque: `/estoque/lotes/novo`, `/estoque/retirada`, `/estoque/item/:id`
- Áreas só para perfil adequado (ex.: rotas admin para novos utilizadores)

A API expõe endpoints sob **`/api/...`**; documentação interativa típica em Swagger quando corres a API localmente.

---

## 4. Estrutura do repositório

```text
README.md              Visão geral e comandos rápidos
ONBOARDING.md          Este ficheiro (onboarding completo + primeiro dia)
backend/
  Backend/             API, Controllers, DbContext, Migrations EF Core
  Shared/              DTOs e modelos partilhados
frontend/
  src/
    app/               Rotas e entrada da aplicação
    domains/           Por domínio (autenticacao, produtos, medicamentos, …)
    infrastructure/    Cliente HTTP, env, erros API
    shared/            Layout, tema, componentes transversais
docs/                  Deploy, onboarding frontend, planejamento PIEX
CanilApp.sln           Solução Visual Studio (nome histórico da solução)
```

---

## 5. Primeiro dia — correr API + frontend

### Pré-requisitos

- [.NET SDK 8](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- Git e acesso ao repositório

### Configuração obrigatória

| Passo | Ação |
|-------|------|
| 1 | Copiar `backend/Backend/appsettings.example.json` → **`appsettings.json`**. |
| 2 | Em `appsettings.json`, definir **Jwt:SecretKey** com ≥ 32 caracteres em desenvolvimento. |
| 3 | Copiar `frontend/.env.example` → **`frontend/.env`**; ajustar **`VITE_DEV_API_PROXY_TARGET`** se a API não estiver em `http://localhost:5000`. |

**Nunca** faças commit de `appsettings.json`, `appsettings.Development.json`, `frontend/.env` nem ficheiros `.db` com dados reais.

### Comandos

**Terminal 1 — API**

```powershell
cd backend\Backend
dotnet restore
dotnet run
```

Por omissão a API usa **`http://localhost:5000`**. Saúde: `GET /api/health` (quando configurado).

**Terminal 2 — Web**

```powershell
cd frontend
npm install
npm run dev
```

Abre o URL indicado pelo Vite (normalmente `http://localhost:5173`). O proxy encaminha `/api` para o backend.

### Abrir no IDE

Abre **`CanilApp.sln`** na raiz no Visual Studio, ou a pasta do monorepo no VS Code / Cursor.

---

## 6. Documentação relacionada

| Documento | Conteúdo |
|-----------|----------|
| [README.md](README.md) | Requisitos, SQLite, estrutura, links |
| [docs/frontend-onboarding.md](docs/frontend-onboarding.md) | Endpoints, auth no front, domínios em detalhe |
| [docs/Deploy_DigitalOcean.md](docs/Deploy_DigitalOcean.md) | Publicar API (Droplet, nginx, systemd) |
| [docs/PIEX_Planejamento_Completo.md](docs/PIEX_Planejamento_Completo.md) | Planejamento da equipa, cronograma, responsabilidades |

---

## 7. Git e segurança

- Executa `git status` antes de commitar; não adiciones passwords nem bases de dados de produção.
- Para partilhar **estrutura** de configuração, altera apenas `appsettings.example.json` ou `.env.example`, sem segredos reais.
- Alinha alterações de contrato API (DTOs, nomes de campos) com **Swagger** e com quem mantém o `backend/`.

---

## 8. Dúvidas rápidas

- **URL da API** em ambientes partilhados e **utilizador de teste**: pergunta à equipa.
- **Evolção da API**: preferir revisão por PR e documentação Swagger atualizada.
