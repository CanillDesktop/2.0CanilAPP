# Resumo do Projeto e Stacks

## Visao geral

O **CanilApp** e um monorepo com foco em gestao de um canil, cobrindo fluxos como produtos, medicamentos, insumos, estoque e usuarios.

Arquitetura principal:
- `backend/Backend`: API Web em ASP.NET Core
- `frontend/`: aplicacao web em React + Vite + TypeScript
- banco de dados SQLite acessado via Entity Framework Core

## Stack do Backend

Base da aplicacao:
- **.NET**: `net8.0`
- **ASP.NET Core Web API**: 8.x
- **Entity Framework Core (SQLite)**: 8.0.11
- **Autenticacao JWT**: `Microsoft.AspNetCore.Authentication.JwtBearer` 8.0.20
- **Documentacao de API**: Swashbuckle.AspNetCore 6.6.2 (Swagger/OpenAPI)
- **Logging**: Serilog.AspNetCore 9.0.0 + sinks Console/File
- **Hash de senha**: BCrypt.Net-Next 4.0.3

Pacotes relevantes do backend (`backend/Backend/Backend.csproj`):
- `BCrypt.Net-Next` 4.0.3
- `Microsoft.AspNetCore.Authentication.JwtBearer` 8.0.20
- `Microsoft.AspNetCore.OpenApi` 8.0.1
- `Microsoft.EntityFrameworkCore.Design` 8.0.11
- `Microsoft.EntityFrameworkCore.Sqlite` 8.0.11
- `Microsoft.EntityFrameworkCore.Tools` 8.0.11
- `Serilog.AspNetCore` 9.0.0
- `Serilog.Sinks.Console` 6.1.1
- `Serilog.Sinks.File` 7.0.0
- `Swashbuckle.AspNetCore` 6.6.2
- `System.IdentityModel.Tokens.Jwt` 8.3.1

## Stack do Frontend

Base da aplicacao:
- **React**: 19.2.4
- **TypeScript**: ~6.0.2
- **Vite**: 8.0.4
- **React Router DOM**: 7.14.0
- **Axios**: 1.15.0
- **MUI (Material UI)**: 9.0.0
- **Emotion**: 11.14.x

Ferramentas de desenvolvimento:
- **ESLint**: 9.39.4
- **@vitejs/plugin-react**: 6.0.1
- **typescript-eslint**: 8.58.0

Pacotes principais do frontend (`frontend/package.json`):
- Dependencias:
  - `@emotion/react` ^11.14.0
  - `@emotion/styled` ^11.14.1
  - `@mui/icons-material` ^9.0.0
  - `@mui/lab` ^9.0.0-beta.2
  - `@mui/material` ^9.0.0
  - `axios` ^1.15.0
  - `react` ^19.2.4
  - `react-dom` ^19.2.4
  - `react-router-dom` ^7.14.0
- DevDependencies:
  - `@eslint/js` ^9.39.4
  - `@types/node` ^24.12.2
  - `@types/react` ^19.2.14
  - `@types/react-dom` ^19.2.3
  - `@vitejs/plugin-react` ^6.0.1
  - `eslint` ^9.39.4
  - `eslint-plugin-react-hooks` ^7.0.1
  - `eslint-plugin-react-refresh` ^0.5.2
  - `globals` ^17.4.0
  - `typescript` ~6.0.2
  - `typescript-eslint` ^8.58.0
  - `vite` ^8.0.4

## Infra e ambiente de execucao

- **Node.js recomendado**: 20 LTS ou superior (conforme README)
- **npm**: incluido com Node.js
- **.NET SDK recomendado**: 8.x
- **Banco de dados**: SQLite (arquivo `.db`, com persistencia em disco no deploy)
- **Proxy de desenvolvimento do frontend**: `/api` encaminhado para `VITE_DEV_API_PROXY_TARGET` (padrao `http://localhost:5000`)

## Comandos principais

Backend:
```powershell
cd backend\Backend
dotnet restore
dotnet run
```

Frontend:
```powershell
cd frontend
npm install
npm run dev
```

## Fontes consultadas

- `README.md` (raiz)
- `frontend/README.md`
- `backend/Backend/Backend.csproj`
- `frontend/package.json`
- `frontend/vite.config.ts`
