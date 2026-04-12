# Onboarding — novos programadores (CanilApp)

Objetivo: em **um dia** conseguires correr **API + frontend** localmente e perceberes onde mexer no código.

## 1. Antes de clonar

- Instala [.NET SDK 8](https://dotnet.microsoft.com/download) e [Node.js 20+](https://nodejs.org/).
- Garante acesso ao repositório Git (conta GitHub com permissões).

## 2. Clonar e abrir

```powershell
git clone <URL_DO_REPOSITORIO>
cd <pasta-do-projeto>
```

Abre a pasta no **Visual Studio** (`CanilApp.sln`) ou no **VS Code / Cursor**.

## 3. Configuração local (obrigatório)

| Passo | O quê |
|-------|--------|
| 3.1 | `backend/Backend/appsettings.example.json` → copiar para **`appsettings.json`**. |
| 3.2 | Em `appsettings.json`, define um **Jwt:SecretKey** longo (≥ 32 caracteres) para desenvolvimento. |
| 3.3 | `frontend/.env.example` → copiar para **`frontend/.env`** (ajusta `VITE_DEV_API_PROXY_TARGET` se a API não estiver na porta 5000). |

**Nunca** commits `appsettings.json`, `appsettings.Development.json` ou `frontend/.env` — estão ignorados no Git.

## 4. Correr o projeto

**Terminal 1 — API**

```powershell
cd backend\Backend
dotnet restore
dotnet run
```

Confirma no browser ou com `curl`: `http://localhost:5000/api/health` (se existir no teu build).

**Terminal 2 — Web**

```powershell
cd frontend
npm install
npm run dev
```

Abre o URL que o Vite indicar (normalmente `http://localhost:5173`). O proxy encaminha `/api` para o backend.

## 5. Onde está cada coisa

| Área | Pasta | Notas |
|------|--------|--------|
| Controladores e API | `backend/Backend/Controllers/` | Rotas `/api/...` |
| Base de dados (EF) | `backend/Backend/Context/`, `Migrations/` | SQLite por omissão em `data/` |
| DTOs / enums | `backend/Shared/` | Referenciado pelo Backend (e conceitos alinhados ao frontend) |
| UI React | `frontend/src/` | Por domínio em `domains/` |
| HTTP / env no front | `frontend/src/infrastructure/` | Cliente Axios, variáveis `VITE_*` |

## 6. Leitura recomendada

1. [README.md](README.md) — visão geral e comandos.
2. [docs/frontend-onboarding.md](docs/frontend-onboarding.md) — endpoints, autenticação e estrutura do frontend.
3. [docs/Deploy_DigitalOcean.md](docs/Deploy_DigitalOcean.md) — só quando fores envolver-te em deploy.

## 7. Git e segredos

- Faz `git status` antes de commitar; não adiciones ficheiros com passwords ou `.db` de produção.
- Se precisares de partilhar **estrutura** de configuração, altera só `appsettings.example.json` ou `.env.example`, sem valores reais.

## 8. Dúvidas

Pergunta à equipa qual é o **URL da API** em ambientes partilhados e se existe **utilizador de teste**. Para evolução da API, alinha alterações de contrato com quem mantém o `backend/`.
