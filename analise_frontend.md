# Análise técnica do frontend — CanilApp

Contexto de uso considerado: ~30 usuários/dia, distribuídos em ~8h, todos os dias da semana. O volume não exige arquitetura de “big tech”; as recomendações priorizam **produção segura, previsível e fácil de operar**, sem reescrever o projeto.

---

## Visão Geral

O frontend é uma SPA **React 19** com **Vite 8**, **TypeScript** e **React Router 7**, usando **Axios** como cliente HTTP único (singleton). A organização segue um **corte por domínios** (`src/domains/*`) com camadas reconhecíveis: `api` (HTTP cru), `services` (orquestração), `hooks` (estado de tela), `components` e `pages`. Há infraestrutura compartilhada em `src/infrastructure` e utilitários/componentes em `src/shared`.

O fluxo de dados é majoritariamente **estado local + Context API** apenas para autenticação (`ContextoAutenticacao`), o que é adequado ao tamanho atual do app.

Build de produção observado (ambiente local): **~308 kB JS** (~**95 kB gzip**), **~4,5 kB CSS** (~**1,5 kB gzip**), **um único chunk JS** — típico de app sem lazy loading de rotas; para o perfil de uso, o tamanho é **aceitável**, mas há margem de melhoria em cache e tempo de primeira pintura se o app crescer.

Pontos críticos para produção: **fallback de URL da API para `localhost` quando a variável de ambiente não está definida**, **tokens em `localStorage`** (trade-off de segurança com XSS), **renovação de token implementada no serviço mas não integrada ao cliente HTTP em caso de 401**, e **ausência de cancelamento de requisições** (risco de condição de corrida em navegação rápida).

---

## Problemas Encontrados

### Configuração e deploy

- **Prioridade:** Alta  
- **Problema:** Em `variaveisAmbiente.ts`, se `VITE_URL_BASE_API` estiver vazia em build de **produção**, a URL base da API cai para `http://localhost:5000`. Isso é um “default perigoso”: um deploy sem `.env` correto aponta o browser para o computador do usuário.  
- **Impacto:** Login e todas as chamadas falham de forma confusa em produção; possível falsa sensação de “API fora” quando o erro é só configuração.  
- **Solução recomendada:** Em `import.meta.env.PROD`, **falhar explicitamente** (ex.: `throw` em tempo de build ou mensagem clara no console + valor inválido) se `VITE_URL_BASE_API` não estiver definida; ou usar apenas string vazia com **reverse proxy** no mesmo host e documentar isso como requisito. Evite `localhost` como fallback em produção.

### Consumo de API e sessão

- **Prioridade:** Alta  
- **Problema:** Existe `servicoAutenticacao.renovarSePossivel()` e endpoint de refresh, porém **não há interceptor** no Axios que, ao receber **401**, tente refresh e repita a requisição (ou faça logout coordenado).  
- **Impacto:** Após expiração do access token, o usuário pode ver erros genéricos até relogar manualmente; UX ruim e suporte desnecessário.  
- **Solução recomendada:** Implementar fluxo controlado no `criarClienteHttp` (fila simples de retries, evitar loop infinito no refresh) ou política explícita: 401 → tentar refresh uma vez → sucesso atualiza tokens e refaz request; falha → `limparSessao()` + redirecionar para `/login`.

- **Prioridade:** Média  
- **Problema:** Nenhuma requisição usa `AbortController` / `signal` do Axios; ao desmontar páginas ou mudar rota durante fetch, a resposta ainda pode atualizar estado.  
- **Impacto:** Avisos no console (React) e, em casos raros, atualização de estado em componente já desmontado ou dados “trocados” entre telas.  
- **Solução recomendada:** Passar `signal` a partir de `useEffect` cleanup (`const c = new AbortController(); … return () => c.abort()`) até as funções `cliente.get/post` ou encapsular em `useEstadoAssincrono` com cancelamento na operação seguinte.

- **Prioridade:** Baixa (para o volume atual)  
- **Problema:** Não há política de **retry** (rede instável, 502 transitório).  
- **Impacto:** Falhas pontuais viram erro imediato para o usuário.  
- **Solução recomendada:** Retry seletivo (ex.: idempotente GET, máximo 1–2 tentativas com backoff) ou deixar documentado como melhoria futura se a rede for estável.

### Performance

- **Prioridade:** Baixa / Média (depende do crescimento do app)  
- **Problema:** `RotasApp.tsx` importa todas as páginas de forma **estática**; não há `React.lazy` + `Suspense`. O bundle vira **um único arquivo JS** grande.  
- **Impacto:** Primeira carga carrega código de telas que o usuário pode nunca abrir; impacto modesto com ~95 kB gzip atual, mas tende a piorar com novos módulos.  
- **Solução recomendada:** Lazy por rota de domínio (ex.: `lazy(() => import('.../PaginaListagemProdutos'))`) e fallback de loading leve; opcionalmente `manualChunks` no Vite só se o bundle crescer muito.

- **Prioridade:** Baixa  
- **Problema:** `useEstadoAssincrono` zera `dados` ao iniciar nova execução (`setEstado({ dados: null, carregando: true, … })`), o que pode causar **piscar** da tabela/detalhe em reconsultas.  
- **Impacto:** UX menos polida em refetch ou Strict Mode em desenvolvimento.  
- **Solução recomendada:** Manter dados anteriores até sucesso (`carregando: true` sem limpar `dados`) ou usar flag `isFetching` separada de `isLoading`.

- **Prioridade:** Baixa  
- **Problema:** Pouco uso de `useMemo`/`memo` além do contexto de autenticação; na prática, com ~30 usuários, **não é problema** — evitar micro-otimizações sem medição.  
- **Impacto:** Nenhum relevante no estado atual; risco futuro se listas grandes + re-renders pesados forem adicionados.  
- **Solução recomendada:** Medir com React DevTools Profiler antes de memoizar listas ou células.

### Segurança no frontend

- **Prioridade:** Média / Alta (conforme política da instituição)  
- **Problema:** Access e refresh tokens e dados do usuário em **`localStorage`** (`armazenamentoSessao.ts`). Qualquer XSS com execução de script no origin pode ler tokens.  
- **Impacto:** Comprometimento de conta em cenário de XSS; refresh token longevo aumenta janela de abuso.  
- **Solução recomendada:** Reduzir superfície de XSS (CSP, sanitização se houver HTML futuro); avaliar **cookies HttpOnly + Secure** geridos pelo backend (BFF ou cookies de API) — mudança maior, alinhar com backend. Para curto prazo: garantir que dependências estejam atualizadas e não renderizar HTML não confiável.

- **Prioridade:** Média  
- **Problema:** `index.html` não define **Content-Security-Policy** nem outros headers de segurança (normalmente configurados no servidor que serve o `dist/`, não só no HTML).  
- **Impacto:** Navegador não restringe origens de script/estilo; maior impacto em caso de injeção ou CDN comprometida.  
- **Solução recomendada:** Definir CSP restritiva no servidor estático (IIS, Nginx, Cloudflare, etc.) compatível com Vite (`'self'`, API permitida).

- **Prioridade:** Baixa  
- **Problema:** Não há uso de `dangerouslySetInnerHTML` no código atual — bom para XSS; manter essa disciplina em PRs futuros.  
- **Impacto:** —  
- **Solução recomendada:** Manter política de code review; se rich text for necessário no futuro, usar sanitização explícita (biblioteca dedicada).

### UX / UI e acessibilidade

- **Prioridade:** Média  
- **Problema:** Feedback de erro/sucesso existe (`PainelErro`, `painel-sucesso`, `IndicadorCarregamento` com `role="status"` e `aria-live="polite"` — bom), mas **navegação ativa** no `LeiautePrincipal` não marca o link atual (`aria-current="page"`), e o `<nav>` poderia ter `aria-label`.  
- **Impacto:** Usuários de leitor de tela e teclado têm menos contexto de “onde estou”.  
- **Solução recomendada:** Usar `NavLink` do React Router ou comparar `useLocation()` para definir `aria-current` e rótulo da região de navegação.

- **Prioridade:** Média  
- **Problema:** Tabelas (`TabelaProdutos` e similares) não usam `scope` em `<th>`, sem `caption` opcional; formulários não associam erros de campo via `aria-describedby` quando a API devolve erro genérico no topo.  
- **Impacto:** Acessibilidade WCAG parcial; erros podem não ser anunciados no campo certo.  
- **Solução recomendada:** `<th scope="col">`; para erros por campo (futuro), ids estáveis ligando mensagem ao input.

- **Prioridade:** Baixa  
- **Problema:** Uso de `window.confirm` para exclusões — funcional, porém pouco alinhado a um painel “produto final”.  
- **Impacto:** UX básica; em mobile/desktop inconsistente.  
- **Solução recomendada:** Modal simples reutilizável (só quando o time quiser polir UI).

### Formulários

- **Prioridade:** Média  
- **Problema:** Validação majoritariamente **HTML5** (`required`, `minLength`, `type="email"`). Campos numéricos e regras de negócio (ex.: quantidade > 0, combinações) dependem do backend para falhar.  
- **Impacto:** Mensagens de erro menos claras; ida e volta desnecessária.  
- **Solução recomendada:** Validação mínima no cliente espelhando regras críticas da API (sem duplicar tudo); opcionalmente biblioteca leve (Zod + resolver) só onde houver formulários grandes.

- **Prioridade:** Baixa  
- **Problema:** `FormularioCadastroUsuario`: `sobrenome` sem `required` no HTML — pode ou não estar alinhado ao contrato da API.  
- **Impacto:** Erro só após submit se o backend exigir o campo.  
- **Solução recomendada:** Alinhar `required` e DTO com a API.

### Resiliência e observabilidade

- **Prioridade:** Média  
- **Problema:** Não há **Error Boundary** na árvore (`Aplicacao` → rotas). Erro de renderização em uma página derruba toda a UI branca.  
- **Impacto:** Experiência ruim e difícil recuperação sem refresh completo.  
- **Solução recomendada:** Um boundary genérico com mensagem amigável + botão “Recarregar” ou link para início.

- **Prioridade:** Baixa (volume pequeno)  
- **Problema:** Não há integração com **Sentry**, LogRocket, Application Insights, etc.; também não há `console.*` no código fonte analisado — bom para não vazar dados, porém **zero telemetria** de erro de cliente.  
- **Impacto:** Bugs de produção dependem de relato do usuário.  
- **Solução recomendada:** Adicionar um capturador de erros (global `window.onerror` / `unhandledrejection` + serviço) apenas se houver orçamento/privacidade alinhados; para 30 usuários/dia, pode ser **fase 2**.

### Arquitetura e manutenção

- **Prioridade:** Baixa  
- **Problema:** Padrão de hooks mistura `useEstadoAssincrono` com hooks de mutação ad hoc (`useMutacaoMedicamento`, etc.) — consistente o suficiente, mas **duplicação** de try/catch/set estado.  
- **Impacto:** Manutenção um pouco mais verbosa ao adicionar domínios.  
- **Solução recomendada:** Opcional: extrair um `useMutacao` genérico semelhante ao assíncrono; **não obrigatório** agora.

- **Prioridade:** Baixa  
- **Problema:** Cliente HTTP singleton dificulta testes com instância mockada sem indirection extra.  
- **Impacto:** Mais trabalho se testes automatizados de integração forem introduzidos.  
- **Solução recomendada:** Injeção de cliente ou factory em testes; manter singleton em runtime.

---

## Pontos Positivos

- **Estrutura por domínios** clara (`domains`, `infrastructure`, `shared`, `app`), com separação **api → service → hook → page**, facilitando localizar código e onboard novos devs.  
- **Cliente HTTP centralizado** com base URL configurável, timeout de 30s, JSON padrão e erros normalizados (`ErroApi` + `extrairMensagemErroApi`).  
- **TypeScript** com regras úteis (`noUnusedLocals`, `noUnusedParameters`) e ESLint com React Hooks — base sólida para evolução.  
- **Stack enxuta** (sem Redux/Zustand desnecessários para o tamanho atual): Context só para auth é uma escolha ** proporcional** ao volume de usuários e complexidade.  
- **UX de estados assíncronos** recorrente: `IndicadorCarregamento` + `PainelErro` em listas e formulários; padrão repetível.  
- **CSS** com variáveis, dark mode via `prefers-color-scheme`, layout responsivo (`max-width`, `flex-wrap`, breakpoints em tipografia).  
- **Proxy do Vite** para `/api` em desenvolvimento evita dor de CORS local (`vite.config.ts`).  
- **Bundle atual** moderado em gzip; dependências mínimas (React, Router, Axios).  
- **Sem `dangerouslySetInnerHTML`** no código — reduz risco XSS por esse vetor.

---

## Recomendações Prioritárias

1. **Corrigir o fallback de `VITE_URL_BASE_API` em produção** — impedir build ou runtime silencioso apontando para `localhost`.  
2. **Integrar refresh de token (401) ao Axios** ou documentar expiração curta + logout automático coerente.  
3. **Revisar deploy**: checklist `.env` de produção, CORS na API, e URL pública documentada (já parcialmente em `.env.example`).  
4. **Adicionar cancelamento (`AbortSignal`) nos efeitos de carregamento** das páginas que fazem fetch ao montar.  
5. **Error Boundary** na raiz da aplicação para falhas de renderização.  
6. **Melhorias incrementais de acessibilidade**: `aria-current` nos links ativos, `aria-label` no `<nav>`, `scope` nas tabelas.  
7. **(Opcional pós-MVP)** Lazy loading de rotas se o número de páginas/código crescer; telemetria de erros se houver necessidade de suporte proativo.

---

*Documento gerado com base na leitura do código em `frontend/` e em um `npm run build` local. Números de bundle podem variar levemente entre versões de dependências e flags de build.*
