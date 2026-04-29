# Onboarding Técnico do Frontend (CanilApp)

Este guia é voltado para desenvolvedores que estão entrando no frontend web do projeto e precisam entender, com profundidade, como o código está estruturado e como evoluir com segurança.

## 1. Visão Geral do Projeto

### Tecnologias utilizadas

- `React` (componentização e UI declarativa).
- `TypeScript` (tipagem estática para reduzir erros e melhorar manutenção).
- `Vite` (servidor de desenvolvimento e build).
- `React Router` (roteamento SPA).
- `Axios` (cliente HTTP).
- `ESLint` + `typescript-eslint` (padronização e qualidade de código).
- `Material UI` (`@mui/*`) e `@emotion/*` (biblioteca de componentes/estilização, disponível no projeto).

### Objetivo do frontend dentro do sistema

O frontend é a camada de interação do usuário com os módulos de negócio (autenticação, usuários, produtos, medicamentos, insumos, estoque e sincronização). Ele:

- renderiza a experiência de uso;
- protege rotas que exigem sessão;
- consome a API do backend via HTTP;
- transforma respostas de infraestrutura em estado e feedback de UI.

## 2. Estrutura de Pastas

O projeto usa **organização por domínio (feature-based)**, complementada por camadas transversais.

```text
frontend/
  src/
    app/
    domains/
    infrastructure/
    shared/
    assets/
    index.css
    main.tsx
```

### `app/`

**Responsabilidade**
- Ponto de orquestração da aplicação: providers globais, páginas transversais e rotas.

**O que deve ir**
- `routes/RotasApp.tsx`
- `providers/ContextoAutenticacao.tsx`
- páginas não ligadas a um domínio específico (ex.: `app/pages/PaginaInicio.tsx`)

**O que não deve ir**
- lógica de API específica de domínio;
- componentes de formulário de domínio.

**Boas práticas**
- manter `app` enxuto: ele coordena, não implementa regra de domínio.

### `domains/`

Cada domínio segue um recorte como `autenticacao`, `usuarios`, `produtos`, `medicamentos`, `insumos`, `estoque` e `sincronizacao`, normalmente com:

- `components/`
- `pages/`
- `hooks/`
- `services/`
- `types/`
- `api/`

#### `components/`

**Responsabilidade**
- Componentes de UI reutilizáveis dentro do domínio.

**Deve conter**
- formulários, tabelas e blocos visuais locais do módulo.

**Não deve conter**
- chamada HTTP direta com `axios`;
- roteamento global.

**Exemplo**
- `domains/produtos/components/FormularioProduto.tsx`

#### `pages/`

**Responsabilidade**
- Componentes de rota (entrada de tela), composição da página.

**Deve conter**
- montagem da tela e integração com hooks de domínio.

**Não deve conter**
- regra de infraestrutura HTTP.

**Exemplo**
- `domains/medicamentos/pages/PaginaListagemMedicamentos.tsx`

#### `hooks/`

**Responsabilidade**
- Estado da tela e ações assíncronas do domínio.

**Deve conter**
- `useAlgo()` focado em orquestrar `services` e estado.

**Não deve conter**
- JSX;
- detalhes de roteamento de alto nível.

**Exemplo**
- `domains/produtos/hooks/useProdutos.ts`

#### `services/`

**Responsabilidade**
- Camada intermediária de aplicação do domínio, desacoplando hooks de `api/`.

**Deve conter**
- métodos de intenção de negócio (`listar`, `criar`, `excluir`).

**Não deve conter**
- estado de React;
- manipulação de elementos de UI.

**Exemplo**
- `domains/produtos/services/servicoProdutos.ts`

#### `types/`

**Responsabilidade**
- Contratos TypeScript do domínio (DTOs, filtros, tipos de leitura/cadastro).

**Deve conter**
- tipos pequenos e coesos por caso de uso.

**Não deve conter**
- funções com regra de negócio.

**Exemplo**
- `domains/usuarios/types/tiposUsuarios.ts`

#### `api/`

**Responsabilidade**
- Mapeamento de endpoints HTTP do domínio.

**Deve conter**
- funções que chamam `obterClienteHttp()` e retornam dados tipados.

**Não deve conter**
- estado React;
- renderização.

**Exemplo**
- `domains/produtos/api/produtosApi.ts`

### `infrastructure/`

**Responsabilidade**
- Preocupações técnicas de baixo nível (HTTP e configuração de ambiente).

**Deve conter**
- criação/configuração de cliente HTTP;
- tratamento técnico de erros de transporte;
- leitura de variáveis de ambiente.

**Não deve conter**
- componente React de tela;
- regra de negócio específica de um domínio.

**Exemplos**
- `infrastructure/http/criarClienteHttp.ts`
- `infrastructure/http/erroApi.ts`
- `infrastructure/config/variaveisAmbiente.ts`

### `shared/`

**Responsabilidade**
- Reuso transversal entre domínios.

**Subpastas existentes**
- `shared/components/`
- `shared/hooks/`
- `shared/services/`
- `shared/types/`
- `shared/utils/`

**Boas práticas**
- mover para `shared` apenas quando o reuso for real em mais de um domínio.

### `assets/`

**Responsabilidade**
- arquivos estáticos internos do `src` (ex.: SVG importado em componentes).

**Não deve conter**
- lógica de aplicação.

### `styles/` (se existir)

No estado atual, não há pasta `styles/` dedicada; o projeto usa `index.css` e estilos por componente.

**Se for criada**
- concentrar tokens globais (cores, espaçamento) e estilos base;
- evitar CSS de domínio altamente específico dentro de `styles/` global.

### `utils/` (se existir)

O projeto já possui `shared/utils/`.

**Responsabilidade**
- helpers puros sem estado e sem dependência de UI.

**Exemplo**
- `shared/utils/montarQueryString.ts`

## 3. Organização Arquitetural

### Separação de responsabilidades

- **UI**: `pages` + `components`.
- **Lógica de tela/estado**: `hooks`.
- **Orquestração de casos de uso**: `services`.
- **Acesso a dados**: `api` + `infrastructure/http`.

### Padrão adotado

- **Feature-based** por domínio (`domains/*`).
- Dentro de cada feature, separação por camada (`components`, `hooks`, `services`, `api`, `types`).
- Camadas transversais em `app`, `shared` e `infrastructure`.

### Comunicação entre camadas

Fluxo preferencial:

`page/component -> hook -> service -> api -> infrastructure/http -> backend`

Essa direção reduz acoplamento e facilita testes/mocks.

## 4. Roteamento

### Como funciona

- O app é inicializado em `main.tsx` com `BrowserRouter`.
- As rotas são declaradas em `app/routes/RotasApp.tsx`.
- O layout raiz é `LeiautePrincipal`.
- Rotas autenticadas ficam dentro de `RotaProtegida`.

### Onde as rotas são definidas

- Arquivo central: `src/app/routes/RotasApp.tsx`.

### Como adicionar uma nova rota

1. Criar a página em `domains/<dominio>/pages/`.
2. Importar a página em `RotasApp.tsx`.
3. Adicionar `<Route path="..." element={<SuaPagina />} />`.
4. Se precisar autenticação, colocar dentro do bloco de `RotaProtegida`.
5. Opcionalmente adicionar link de navegação em `shared/components/LeiautePrincipal.tsx`.

### Rotas públicas vs privadas

- **Públicas (hoje)**: `/`, `/login`, `/cadastro`.
- **Privadas**: blocos encapsulados por `RotaProtegida` (ex.: `/produtos`, `/estoque`, `/sincronizacao`).

### Lazy loading

No momento, as rotas são importadas de forma direta (sem `React.lazy`).  
É uma otimização possível para reduzir bundle inicial em telas maiores.

## 5. Sintaxe e Padrões de Código

### Convenções de nomenclatura

- Componentes e páginas: `PascalCase` (ex.: `PaginaLogin`, `FormularioProduto`).
- Hooks: prefixo `use` (ex.: `useListaProdutos`).
- Serviços utilitários de domínio: `servicoX`.
- Tipos: `XxxDto`, `XxxFiltroDto`, `XxxLeituraDto`.
- Nomes de arquivos e símbolos em português, coerentes com o domínio.

### Padrão de componentes

- Function components.
- Props tipadas com TypeScript.
- Evitar componentes com muitas responsabilidades.

### Uso de hooks

- `useState`, `useEffect`, `useCallback` para estado/efeitos.
- Hooks customizados para centralizar fluxo assíncrono e regras de tela.

### Tipagem com TypeScript

- Tipos explícitos para payloads de API e estados críticos.
- Evitar `any`; preferir tipos de domínio por arquivo de `types/`.

## 6. Hooks

### Hooks nativos vs customizados

- **Nativos**: vêm do React (`useState`, `useEffect`, etc.).
- **Customizados**: encapsulam lógica reaproveitável da aplicação (ex.: `useEstadoAssincrono`, `useSincronizacao`).

### Quando criar um hook customizado

- Quando a mesma lógica de estado/efeito pode ser reutilizada;
- quando a página começa a ficar grande demais;
- quando quiser esconder detalhes de chamadas assíncronas da UI.

### Exemplos

- `shared/hooks/useEstadoAssincrono.ts` para padronizar `carregando/erro/dados`.
- `domains/produtos/hooks/useProdutos.ts` para carregar lista/detalhe.

### Organização da pasta `hooks/`

- Hooks do domínio ficam no próprio domínio (`domains/<dominio>/hooks`).
- Hooks genéricos/transversais ficam em `shared/hooks`.

## 7. Components

### Tipos de componentes no projeto

- **Globais/reutilizáveis**: em `shared/components` (ex.: `IndicadorCarregamento`, `PainelErro`, `LeiautePrincipal`).
- **Específicos de domínio**: em `domains/<dominio>/components`.
- **Específicos de página**: quando não há reuso, podem permanecer próximos da própria página.

### Boas práticas de reutilização

- Extrair componente quando houver repetição real;
- manter API de props simples e explícita;
- evitar acoplamento de componente visual com chamadas HTTP.

### Separação de responsabilidade

- Componente visual deve receber dados e callbacks;
- hook/service faz carregamento e regra;
- `api`/infra cuida da comunicação externa.

## 8. Pages

### Papel das páginas

Páginas representam telas navegáveis e pontos de entrada de rota. Elas:

- compõem layout e componentes;
- conectam hooks de domínio;
- disparam ações de fluxo da tela.

### Conexão com rotas

Cada página é registrada no `RotasApp.tsx` via `<Route ... />`.

### Diferença entre `pages` e `components`

- `pages`: orientadas a rota e fluxo de tela completo;
- `components`: blocos menores, reutilizáveis, focados em apresentação/entrada local.

## 9. Services

### Responsabilidade

`services` fazem a ponte entre hooks e `api`, oferecendo métodos semânticos para o domínio.

### Organização das APIs

- `domains/*/api`: funções por endpoint.
- `domains/*/services`: fachada de uso da feature.
- `infrastructure/http`: cliente base, interceptors e tratamento uniforme de erro.

### Uso com Axios

- O Axios é configurado em `infrastructure/http/criarClienteHttp.ts`.
- Acesso centralizado por singleton via `obterClienteHttp()`.
- Interceptor de request adiciona `Authorization: Bearer <token>` quando houver sessão.

### Tratamento de erros

- Interceptor de response converte falhas para `ErroApi`.
- `extrairMensagemErroApi` normaliza mensagens para exibição na UI.

## 10. Types

### Uso de TypeScript

TypeScript é usado para contratos de entrada/saída da API e estruturas de estado da UI.

### Organização de interfaces e tipos

- Tipos específicos de domínio em `domains/<dominio>/types`.
- Tipos compartilhados em `shared/types`.

### Boas práticas

- Nomear tipos pelo contexto de uso (cadastro, leitura, filtro).
- Evitar “tipo genérico único” para múltiplas telas com necessidades diferentes.

## 11. Arquivo `vite.config.ts`

### Para que serve o Vite no projeto

O Vite fornece:

- ambiente de desenvolvimento rápido;
- build de produção;
- servidor local com proxy para API em desenvolvimento.

### O que é configurado neste arquivo

No projeto atual, `vite.config.ts` define:

- plugin React (`@vitejs/plugin-react`);
- configurações do servidor (`host`, `port`, `strictPort`);
- proxy de `/api` para backend via `VITE_DEV_API_PROXY_TARGET`.

### Alias de importação (`@/...`)

Atualmente, **não há alias `@` configurado** no `vite.config.ts` nem em `tsconfig.app.json`.  
Os imports usam caminhos relativos (`../../...`).

Se desejar adotar alias, é necessário configurar em ambos (Vite + TypeScript).

### Configurações importantes

- `server.host = '127.0.0.1'`: evita problemas de resolução IPv6/localhost em alguns cenários do Windows.
- `server.port = 5173` + `strictPort = true`: garante porta fixa.
- `server.proxy['/api']`: remove necessidade de CORS no browser durante dev quando `VITE_URL_BASE_API` está vazia.

## 12. Variáveis de Ambiente (`.env`)

### Para que servem

Permitem parametrizar comportamento por ambiente sem hardcode no código.

### Como são utilizadas no frontend

- `VITE_URL_BASE_API`: URL base absoluta da API (geralmente produção/homologação).
- `VITE_DEV_API_PROXY_TARGET`: alvo da API local para o proxy do Vite em desenvolvimento.

Essas variáveis são lidas em `infrastructure/config/variaveisAmbiente.ts` e em `vite.config.ts`.

### Prefixo obrigatório

No frontend com Vite, variáveis expostas ao código cliente devem usar prefixo `VITE_`.

### Boas práticas de segurança

- nunca versionar `.env` com segredos;
- manter `.env.example` apenas com placeholders e instruções;
- lembrar que variáveis `VITE_*` ficam acessíveis no bundle do cliente (não armazenar segredo sensível).

## 13. Página de Infrastructure

No frontend atual, **não existe uma “página infrastructure” de rota** (`/infrastructure`) para uso de negócio.

O termo “infrastructure” no projeto representa **camada técnica interna**, com foco em:

- configuração de ambiente (`infrastructure/config`);
- cliente HTTP e normalização de erros (`infrastructure/http`).

### O que ela representa no sistema

Representa a base técnica que sustenta consumo de API, autenticação via header e padronização de falhas, sem exibir UI diretamente.

### Que dados/funcionalidades expõe

- fábrica de cliente Axios;
- interceptors;
- classe `ErroApi` e função `extrairMensagemErroApi`;
- resolução da URL base.

### Quando e por quem é utilizada

- usada indiretamente por `domains/*/api` e, por consequência, por toda a aplicação;
- usada por desenvolvedores ao evoluir integração HTTP/configuração de ambiente;
- não é usada por usuários finais como tela.

> Observação: a rota `sincronizacao` é uma página de operação/compatibilidade de backend, não a camada `infrastructure`.

## 14. Boas Práticas Gerais

- manter fluxo arquitetural (`page -> hook -> service -> api -> infrastructure`);
- evitar chamadas HTTP fora de `domains/*/api` e `infrastructure/http`;
- manter arquivos pequenos, coesos e com responsabilidade única;
- tipar payloads e respostas da API com precisão;
- preferir componentes reaproveitáveis quando o padrão se repetir;
- padronizar mensagens de erro para boa UX;
- revisar imports relativos longos e considerar alias se a base crescer;
- ao criar nova feature, repetir o esqueleto de pastas do domínio;
- documentar decisões arquiteturais relevantes para facilitar manutenção futura.

---

## Referência rápida de entrada no projeto

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Ponto de entrada da aplicação: `src/main.tsx`.
