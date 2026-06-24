# Módulo de Usuários — Documentação Técnica

Documentação da refatoração do ciclo de vida de usuários no CanipApp: ativação, inativação, reativação, exclusão lógica, exclusão física, auditoria e revogação de sessões.

**Data da refatoração:** junho/2026  
**Migration:** `20260624004809_UsuarioStatusAuditoriaTokenVersion`

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Modelo de dados](#modelo-de-dados)
3. [Ciclo de vida](#ciclo-de-vida)
4. [Rotas da API](#rotas-da-api)
5. [Autenticação e sessões](#autenticação-e-sessões)
6. [Frontend](#frontend)
7. [Regras de negócio](#regras-de-negócio)
8. [Arquivos alterados](#arquivos-alterados)
9. [Deploy e migração](#deploy-e-migração)

---

## Visão geral

Antes da refatoração, o sistema usava apenas `IsDeleted = true` tanto para **inativação** quanto para **exclusão lógica**, sem possibilidade de reativar via API, com JWT válido após inativação e filtros de usuários inativos quebrados após reload.

A refatoração introduziu:

- Enum `StatusUsuario` com três estados distintos
- Campos de auditoria por ação (`InactivatedAt/By`, `DeletedAt/By`, `ReactivatedAt/By`)
- `TokenVersion` para invalidação imediata de JWT
- Revogação automática de refresh tokens
- Listagem paginada server-side com filtros por status
- Endpoint de **reativação** (novo)
- Validação de senha do administrador em todas as ações destrutivas

---

## Modelo de dados

### Tabela `Usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Status` | INTEGER | `1`=Ativo, `2`=Inativo, `3`=Excluido |
| `TokenVersion` | INTEGER | Incrementado a cada evento que invalida JWT |
| `InactivatedAt` | TEXT (UTC) | Data/hora da inativação |
| `InactivatedBy` | TEXT | Executor da inativação |
| `DeletedAt` | TEXT (UTC) | Data/hora da exclusão lógica |
| `DeletedBy` | TEXT | Executor da exclusão lógica |
| `ReactivatedAt` | TEXT (UTC) | Data/hora da reativação |
| `ReactivatedBy` | TEXT | Executor da reativação |
| `IsDeleted` | BOOLEAN | Mantido por compatibilidade; sincronizado automaticamente (`true` quando `Status != Ativo`) |
| `EditadorPor` | TEXT | Último editor (atualizado em todas as mutações) |

### Enum `StatusUsuario`

```csharp
public enum StatusUsuario
{
    Ativo = 1,
    Inativo = 2,
    Excluido = 3
}
```

### Índice

- `IX_Usuarios_Status` — otimiza filtros de listagem por status

---

## Ciclo de vida

```
                    ┌─────────────┐
                    │   ATIVO     │
                    └──────┬──────┘
           inativar        │         excluir (soft)
              ┌────────────┼────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   INATIVO   │           │  EXCLUÍDO   │
       └──────┬──────┘           └──────┬──────┘
         reativar│              excluir (soft)
              │    └──────────────────────┘
              ▼                         │
       ┌─────────────┐                  │ hardDelete=true
       │   ATIVO     │                  ▼
       └─────────────┘           [removido do DB]
```

| Transição | Endpoint | Efeito |
|-----------|----------|--------|
| Ativo → Inativo | `PATCH /inativar` | Bloqueia login; revoga sessões |
| Inativo → Ativo | `PATCH /reativar` | Restaura acesso; revoga sessões |
| Ativo/Inativo → Excluído | `DELETE` (soft) | Exclusão lógica; revoga sessões |
| Excluído → removido | `DELETE ?hardDelete=true` | Exclusão física + CASCADE em `RefreshTokens` |

**Efeitos colaterais em toda transição crítica:**

1. `TokenVersion++`
2. Todos os refresh tokens ativos do usuário são revogados
3. JWTs em circulação deixam de funcionar no próximo request (middleware)

---

## Rotas da API

Base URL: `/api/Usuarios`

### Rotas novas ou significativamente alteradas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| **PATCH** | `/api/Usuarios/{id}/reativar` | ADMIN | **Nova** — reativa usuário inativo |
| **GET** | `/api/Usuarios` | ADMIN | **Alterada** — listagem paginada com filtros |
| **DELETE** | `/api/Usuarios/{id}` | ADMIN | **Alterada** — exige senha no body; suporta `hardDelete` |

### Todas as rotas do módulo

#### `GET /api/Usuarios`

Listagem paginada de usuários (admin).

**Query parameters:**

| Parâmetro | Tipo | Default | Valores |
|-----------|------|---------|---------|
| `status` | string | `ativo` | `ativo`, `inativo`, `excluido`, `todos` |
| `busca` | string | — | Filtro por nome ou e-mail |
| `pageNumber` | int | `1` | Página (mín. 1) |
| `pageSize` | int | `10` | Itens por página (máx. 50) |

**Comportamento do filtro `status`:**

| Valor | Retorna |
|-------|---------|
| `ativo` | Somente usuários ativos |
| `inativo` | Somente usuários inativos |
| `excluido` | Somente usuários excluídos logicamente |
| `todos` | Ativos + inativos (excluídos ficam fora) |

**Resposta (200):**

```json
{
  "items": [
    {
      "id": 1,
      "email": "admin@exemplo.com",
      "primeiroNome": "Admin",
      "sobrenome": "Sistema",
      "permissao": 1,
      "status": 1,
      "isDeleted": false,
      "inactivatedAt": null,
      "inactivatedBy": null,
      "deletedAt": null,
      "deletedBy": null,
      "reactivatedAt": null,
      "reactivatedBy": null,
      "tokenVersion": 1,
      "dataHoraCriacao": "2026-01-01T00:00:00Z",
      "dataHoraAtualizacao": "2026-06-24T00:00:00Z"
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 8,
  "totalPages": 1,
  "hasPrevious": false,
  "hasNext": false
}
```

---

#### `GET /api/Usuarios/{id}`

Retorna usuário **ativo** por ID.

- **Auth:** qualquer usuário autenticado
- **404** se inativo, excluído ou inexistente

---

#### `GET /api/Usuarios/resumo-filtro-retiradas`

Lista resumida de usuários **ativos** para filtros do histórico de retiradas.

- **Auth:** qualquer usuário autenticado

---

#### `POST /api/Usuarios`

Cadastro de novo usuário.

- **Auth:** público (sem token)
- Cria usuário com `Status = Ativo`, `TokenVersion = 1`

**Body:**

```json
{
  "primeiroNome": "João",
  "sobrenome": "Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "senhaConfirmacao": "senha123",
  "permissao": 0
}
```

---

#### `PUT /api/Usuarios/{id}`

Atualiza dados do usuário (nome, e-mail, permissão).

- **Auth:** autenticado (self ou ADMIN para outros)
- Não altera `Status`
- Usuários excluídos não podem ser editados

---

#### `PATCH /api/Usuarios/{id}/alterar-senha`

Altera a senha do usuário.

- **Auth:** autenticado
- Incrementa `TokenVersion` e revoga refresh tokens

**Body:**

```json
{
  "senhaAtual": "senhaAntiga",
  "novaSenha": "senhaNova123"
}
```

---

#### `PATCH /api/Usuarios/{id}/inativar`

Inativa um usuário ativo.

- **Auth:** ADMIN
- Exige confirmação da senha do administrador logado

**Body:**

```json
{
  "senhaConfirmacao": "senhaDoAdmin"
}
```

**Resposta:** `204 No Content`

**Erros comuns:**

| HTTP | Motivo |
|------|--------|
| 400 | Senha incorreta |
| 409 | Auto-inativação ou último admin ativo |
| 404 | Usuário não encontrado ou já inativo |

---

#### `PATCH /api/Usuarios/{id}/reativar` *(nova)*

Reativa um usuário inativo.

- **Auth:** ADMIN
- Exige confirmação da senha do administrador logado
- Somente usuários com `Status = Inativo` podem ser reativados

**Body:**

```json
{
  "senhaConfirmacao": "senhaDoAdmin"
}
```

**Resposta:** `204 No Content`

**Erros comuns:**

| HTTP | Motivo |
|------|--------|
| 400 | Senha incorreta |
| 404 | Usuário não encontrado |
| 422 | Usuário não está inativo (ex.: já ativo ou excluído) |

---

#### `DELETE /api/Usuarios/{id}`

Exclusão lógica (padrão) ou física (hard delete).

- **Auth:** ADMIN
- **Exige senha** no body (correção aplicada nesta refatoração)

**Query parameters:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `hardDelete` | bool | `false` | `true` = exclusão física (somente usuários já excluídos logicamente) |

**Body:**

```json
{
  "senhaConfirmacao": "senhaDoAdmin"
}
```

**Comportamento:**

| `hardDelete` | Status atual | Resultado |
|--------------|--------------|-----------|
| `false` | Ativo ou Inativo | `Status = Excluido` (soft delete) |
| `true` | Excluido | Remove linha do banco + CASCADE em `RefreshTokens` |

**Resposta:** `204 No Content`

---

### Rotas de autenticação relacionadas

| Método | Rota | Alteração |
|--------|------|-----------|
| `POST` | `/api/Auth/login` | Login de inativo/excluído retorna **403** (antes: 500) |
| `POST` | `/api/Auth/refresh` | Falha se usuário não estiver ativo |
| `POST` | `/api/Auth/logout` | Sem alteração |

---

## Autenticação e sessões

### TokenVersion

Cada JWT inclui a claim `TokenVersion`. O middleware `TokenVersionValidationMiddleware` executa após autenticação e:

1. Compara `TokenVersion` do JWT com o valor no banco
2. Verifica se `Status == Ativo`
3. Retorna **401** se inválido

**Eventos que incrementam `TokenVersion`:**

- Inativar usuário
- Reativar usuário
- Excluir usuário (soft)
- Trocar senha

### Revogação de refresh tokens

Método `RevokeAllTokensForUserAsync(userId)` revoga todos os refresh tokens ativos. Executado automaticamente nos fluxos acima.

### Login — respostas padronizadas

| Situação | HTTP | Mensagem |
|----------|------|----------|
| Credenciais inválidas | 400 | Usuário ou senha inválidos |
| Usuário inativo | **403** | Usuário inativo. Favor contatar o suporte/administradores. |
| Usuário excluído | **403** | Usuário não encontrado ou indisponível. |

---

## Frontend

**Rota da aplicação:** `/usuarios`  
**Componente principal:** `PaginaListagemUsuarios.tsx`

### Mapeamento UI → API

| Ação na UI | Função API | Endpoint |
|------------|------------|----------|
| Listar usuários | `listarUsuariosApi` | `GET /api/Usuarios?status=&busca=&pageNumber=&pageSize=` |
| Cadastrar | `criarUsuarioApi` | `POST /api/Usuarios` |
| Editar | `atualizarUsuarioApi` | `PUT /api/Usuarios/{id}` |
| Alterar senha | `trocarSenhaUsuarioApi` | `PATCH /api/Usuarios/{id}/alterar-senha` |
| Inativar | `inativarUsuarioApi` | `PATCH /api/Usuarios/{id}/inativar` |
| Reativar | `reativarUsuarioApi` | `PATCH /api/Usuarios/{id}/reativar` |
| Excluir | `removerUsuarioApi` | `DELETE /api/Usuarios/{id}` |
| Remover definitivamente | `removerUsuarioApi(id, dto, true)` | `DELETE /api/Usuarios/{id}?hardDelete=true` |

### Botões por status

| Status | Botões exibidos |
|--------|-----------------|
| Ativo | Editar · Inativar · Excluir |
| Inativo | Editar · Reativar · Excluir |
| Excluído | Remover definitivamente |

### Filtros (server-side)

| Filtro UI | Parâmetro API |
|-----------|---------------|
| Ativos | `status=ativo` |
| Inativos | `status=inativo` |
| Todos (ativos + inativos) | `status=todos` |
| Excluídos | `status=excluido` |

### Proteções no frontend

- Botões destrutivos desabilitados para o **próprio usuário logado**
- Modal de confirmação com **senha do administrador** em todas as ações críticas
- Mensagens específicas por ação (inativar, reativar, excluir, remover definitivamente)

---

## Regras de negócio

| Regra | Backend | Frontend |
|-------|---------|----------|
| Não inativar/excluir a própria conta | 409 | Botão desabilitado |
| Não remover o último admin ativo | 409 | — (erro exibido no modal) |
| Senha do admin obrigatória em inativar/reativar/excluir | Sim | Modal de confirmação |
| Reativar somente inativos | 422 | Botão só aparece para inativos |
| Hard delete somente de excluídos | 404 se status incorreto | Botão só na listagem de excluídos |
| Usuários excluídos fora da listagem padrão | Filtro `status=excluido` | Aba Gestão → filtro Excluídos |

---

## Arquivos alterados

### Backend

```
Backend/
├── Controllers/
│   ├── UsuariosController.cs      # Rotas atualizadas + reativar
│   └── AuthController.cs          # Tratamento 403 no login
├── DTOs/Usuario/
│   └── UsuarioResponseDTO.cs      # Novos campos expostos
├── Exceptions/
│   └── AcessoNegadoException.cs   # Novo
├── Middleware/
│   └── TokenVersionValidationMiddleware.cs  # Novo
├── Migrations/
│   └── 20260624004809_UsuarioStatusAuditoriaTokenVersion.cs  # Novo
├── Models/
│   ├── Enums/StatusUsuario.cs     # Novo
│   └── Usuarios/UsuariosModel.cs  # Status, auditoria, TokenVersion
├── Pagination/
│   └── UsuarioListagemParameters.cs  # Novo
├── Repositories/
│   ├── UsuariosRepository.cs
│   └── RefreshTokenRepository.cs
├── Services/
│   ├── UsuariosService.cs         # Refatoração completa
│   ├── AuthService.cs             # Claim TokenVersion
│   └── RefreshTokenService.cs
├── Context/CanilAppDbContext.cs
└── Program.cs                     # Middleware registrado
```

### Frontend

```
frontend/src/domains/usuarios/
├── api/usuariosApi.ts
├── services/servicoUsuarios.ts
├── hooks/useUsuarios.ts
├── types/tiposUsuarios.ts
├── pages/PaginaListagemUsuarios.tsx
└── components/
    ├── ListagemUsuariosResponsiva.tsx
    └── PainelFiltrosGestaoUsuarios.tsx
```

---

## Deploy e migração

### Aplicar migration

```powershell
cd backend/Backend
dotnet ef database update
```

### Impacto em sessões existentes

Após o deploy, usuários com JWT antigo (sem claim `TokenVersion`) receberão **401** e precisarão **fazer login novamente**. Isso é intencional para garantir que sessões de contas inativadas sejam encerradas.

### Dados legados

Usuários com `IsDeleted = true` antes da migration foram migrados para `Status = Inativo (2)`.

---

## Referência rápida — o que mudou

| Antes | Depois |
|-------|--------|
| Inativação e exclusão = `IsDeleted=true` | Três estados: Ativo, Inativo, Excluido |
| Sem reativação | `PATCH /api/Usuarios/{id}/reativar` |
| JWT válido após inativação | Invalidação imediata via `TokenVersion` |
| DELETE sem validar senha | DELETE exige `senhaConfirmacao` |
| GET retorna só ativos, sem paginação | GET paginado com filtros `status`, `busca` |
| Login inativo → HTTP 500 | Login inativo → HTTP 403 |
| Refresh tokens não revogados | Revogados em toda ação crítica |
| Frontend: rota `/senha` (404) | Corrigido para `/alterar-senha` |
