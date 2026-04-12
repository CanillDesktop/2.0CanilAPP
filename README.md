# CanilApp

Monorepo com **API ASP.NET Core 8** (`backend/Backend`), biblioteca partilhada **`backend/Shared`** e **frontend web** React + Vite (`frontend/`). Autenticação JWT, gestão de produtos, medicamentos, insumos, estoque e utilizadores.

## Novo na equipa? (onboarding)

1. Instala **.NET SDK 8** e **Node.js 20+**.  
2. Clona o repositório e copia `backend/Backend/appsettings.example.json` → **`appsettings.json`** (JWT com `SecretKey` de pelo menos 32 caracteres).  
3. Copia `frontend/.env.example` → **`frontend/.env`**.  
4. Corre a API (`cd backend/Backend` → `dotnet run`) e o frontend (`cd frontend` → `npm install` → `npm run dev`).

Guia completo para programadores: **[ONBOARDING.md](ONBOARDING.md)**. Detalhe da UI e da API no front: **[docs/frontend-onboarding.md](docs/frontend-onboarding.md)**.

---

## Requisitos

| Ferramenta | Versão indicada |
|------------|-----------------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.x |
| [Node.js](https://nodejs.org/) | 20 LTS ou superior |
| npm | Incluído com Node |

Opcional: [Git](https://git-scm.com/) para clonar e versionar.

## Configuração sensível (local)

1. Na pasta `backend/Backend/`, copia `appsettings.example.json` para **`appsettings.json`** (e, se precisares, `appsettings.Development.json`).
2. Ajusta **JWT** (`SecretKey` com pelo menos 32 caracteres em desenvolvimento) e **ConnectionStrings** se o ficheiro SQLite estiver noutro caminho.
3. No frontend, copia `frontend/.env.example` para **`frontend/.env`** e define `VITE_DEV_API_PROXY_TARGET` se a API não estiver em `http://localhost:5000`.

Estes ficheiros **não** devem ser commitados (estão no `.gitignore`). Nunca coloques segredos de produção no Git.

## Como executar

### Backend (API)

```powershell
cd backend\Backend
dotnet restore
dotnet run
```

Por omissão a API escuta em **`http://localhost:5000`** (ver `Urls` em `appsettings.example.json`). Endpoints sob `/api/...`. Existe rota de saúde em `GET /api/health` quando configurada no projeto.

### Frontend (Vite)

Noutro terminal:

```powershell
cd frontend
npm install
npm run dev
```

O Vite usa proxy para `/api` → backend em `VITE_DEV_API_PROXY_TARGET` (por omissão `http://localhost:5000`), evitando problemas de CORS no desenvolvimento.

### Abrir a solução no Visual Studio

Abre `CanilApp.sln` na raiz do repositório.

## Estrutura do repositório

```text
README.md           # Este ficheiro (visível na página inicial do GitHub)
ONBOARDING.md       # Checklist e primeiro dia para novos devs
backend/
  Backend/          # API ASP.NET Core, Migrations EF Core
  Shared/           # DTOs, enums e modelos partilhados
frontend/           # React + TypeScript + Vite
docs/               # Deploy DigitalOcean, onboarding frontend, guias
```

## SQLite, GitHub e DigitalOcean

- A API usa **SQLite via EF Core** (`Microsoft.EntityFrameworkCore.Sqlite`). **Não** é obrigatório instalar a ferramenta de linha de comando **`sqlite3`** no servidor só para a aplicação correr; ela cria e usa o ficheiro `.db` através do runtime .NET.
- **No GitHub:** versiona o **código** e as **Migrations** (`backend/Backend/Migrations/`). O ficheiro **`*.db`** fica ignorado para não subir dados reais nem caminhos locais. O esquema da base é recriado/atualizado com `dotnet ef database update` (ou com o fluxo de arranque/migrações que o projeto use).
- **Na DigitalOcean:** coloca o ficheiro da base num **disco persistente** (ex.: `/opt/canilapp/data/canilapp.db`) e define `ConnectionStrings__DefaultConnection` (ou equivalente em `appsettings` / variáveis de ambiente) com `Data Source=/caminho/absoluto/...`. Faz **backup** desse ficheiro em produção. Detalhes de Droplet, Nginx e systemd: `docs/Deploy_DigitalOcean.md`.

Se precisares da CLI **`sqlite3`** no servidor, é só para **inspeção ou backup manual** (`sudo apt install sqlite3` no Ubuntu); não substitui o motor que a API já embute.

## Documentação

| Documento | Conteúdo |
|-----------|-----------|
| [ONBOARDING.md](ONBOARDING.md) | Primeiros passos para novos programadores |
| [docs/frontend-onboarding.md](docs/frontend-onboarding.md) | Arquitetura e domínios do frontend |
| [docs/Deploy_DigitalOcean.md](docs/Deploy_DigitalOcean.md) | Publicar a API num Droplet |
| [docs/Guia_Push_DO_CanilApp.md](docs/Guia_Push_DO_CanilApp.md) | Enviar só backend para outro remoto (opcional) |

## Licença e equipa

Projeto académico / equipa CanilApp — ajusta esta secção conforme a política da tua instituição.
