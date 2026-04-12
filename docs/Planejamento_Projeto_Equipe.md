# Planejamento do projeto da equipe

**Curso:** Análise e Desenvolvimento de Sistemas  
**Projeto:** CanipApp — Estoque (Secretaria do Bem-Estar Animal / Canil)  
**Equipe:** Arthur Lázaro Galdino (líder), Mateus da Silva Tomaz, Gabriel de Almeida Andrade  

**Referência de estrutura:** documento *Planejamento do Projeto da Equipe* (PIEX).  
**Issues de apoio:** [CanipApp no GitHub](https://github.com/CanillDesktop/CanipApp/issues)

---

## Índice

1. [Visão geral do projeto](#i-visão-geral-do-projeto)
2. [Instituição](#ii-instituicao)
3. [Objetivo do projeto](#iii-objetivo-do-projeto)
4. [Escopo](#iv-escopo)
5. [Entregas do projeto](#v-entregas-do-projeto)
6. [Cronograma individual — 10 quinzenas](#vi-cronograma-individual--10-quinzenas)
7. [Comunicação](#vii-comunicação)
8. [Recursos](#viii-recursos)
9. [Monitoramento e controle](#ix-monitoramento-e-controle)

---

## I. Visão geral do projeto

| Campo | Conteúdo |
|--------|-----------|
| **Nome do projeto** | CanipApp — controle de estoque (medicamentos, produtos, insumos, equipamentos) |
| **Necessidade identificada** | Gestão de estoque centralizada, substituindo planilhas por sistema desktop + nuvem |
| **Data de início** | 07/04/2026 *(ajustável conforme calendário acadêmico)* |
| **Término previsto (10 quinzenas)** | ~25/08/2026 |
| **Líder de projeto** | Arthur Galdino |
| **Equipe** | Arthur, Mateus, Gabriel |

---

## II. Instituição

Preencher conforme o documento PIEX e acordos com a instituição:

- **Nome da instituição:** Secretaria do Bem-Estar Animal (exemplo do projeto original)
- **Público-alvo:** Profissionais responsáveis pelo gerenciamento do estoque
- **Responsável, telefone, e-mail, outros contatos:** *(manter dados oficiais acordados)*
- **História da instituição:** *(resumo institucional fornecido pela secretaria)*

---

## III. Objetivo do projeto

### Objetivo geral

Disponibilizar um sistema organizado para cadastro, movimentação e consultas de estoque, com persistência e serviços em nuvem quando aplicável.

### Objetivos específicos

- Desenvolver backend em ASP.NET Core e frontend em .NET MAUI.
- Integrar autenticação e recursos em AWS (ex.: Cognito e demais serviços definidos pela equipe).
- Entregar evoluções via Git com pull requests supervisionados pelo líder.
- Produzir relatórios quinzenais e incorporar feedback do orientador e da instituição.

---

## IV. Escopo

### Dentro do escopo

- CRUD e consultas de estoque e telas correspondentes no MAUI.
- Integração com API, autenticação (incl. alinhamento com Cognito — issue [#35](https://github.com/CanillDesktop/CanipApp/issues/35)).
- Identidade visual, componentes reutilizáveis e entrega de **ícones e banners** — issue [#15](https://github.com/CanillDesktop/CanipApp/issues/15).
- Documentação técnica necessária à operação e à apresentação do PI.

### Fora do escopo (quando já acordado com a instituição)

- Manutenção prolongada e custos de nuvem após entrega (por conta da instituição).
- Migração massiva de dados legados, se delegada à equipe da secretaria.

### Indicadores de avaliação

- Pull requests revisados e integrados.
- Issues encaminhadas ou fechadas no repositório.
- Relatório quinzenal e checklist individual.
- Feedback do orientador e da instituição.

---

## V. Entregas do projeto

### Arthur — Backend, integração e nuvem

API ASP.NET Core, endpoints e regras de negócio, validação e tratamento de erros no servidor, integração com serviços AWS necessários, documentação de deploy/configuração, apoio à integração com o app.

**Indicadores:** PRs, relatórios quinzenais, feedback.

### Mateus — Modelagem, dados e ponte backend ↔ app

Models/DTOs conforme divisão do time, ViewModels e ligação com views, apoio em autenticação e **login offline** — issue [#14](https://github.com/CanillDesktop/CanipApp/issues/14), testes de integração com a API, checklists de regressão, polimento de performance e consistência no backend.

**Indicadores:** relatórios quinzenais, feedback.

### Gabriel — Frontend, ícones e banners (foco principal)

Telas MAUI, navegação (incl. **pós-login e pós-cadastro** — [#37](https://github.com/CanillDesktop/CanipApp/issues/37)), design system ([#42](https://github.com/CanillDesktop/CanipApp/issues/42)), **validação de formulários** ([#41](https://github.com/CanillDesktop/CanipApp/issues/41)), **mensagens de sucesso/erro/loading** ([#39](https://github.com/CanillDesktop/CanipApp/issues/39)), **serviços de API no frontend** ([#38](https://github.com/CanillDesktop/CanipApp/issues/38)), **ícones e banners** ([#15](https://github.com/CanillDesktop/CanipApp/issues/15)), abas e filtros de consultas ([#34](https://github.com/CanillDesktop/CanipApp/issues/34)), UX e **empacotamento** com apoio do time ([#36](https://github.com/CanillDesktop/CanipApp/issues/36)).

**Indicadores:** relatórios quinzenais, feedback.

---

## VI. Cronograma individual — 10 quinzenas

Cada quinzena indica a **data sugerida para o relatório de fechamento** (fim da quinzena). Ajuste conforme o calendário da disciplina.

### 1ª quinzena — Data: 21/04/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Revisar e estabilizar API e contratos dos principais recursos (medicamentos/produtos/insumos); alinhar com o frontend o que já existe; documentar endpoints no Swagger; corrigir bugs bloqueantes de backend. |
| **Mateus** | Mapear models/viewmodels existentes; propor base comum para CRUD com abas ([#40](https://github.com/CanillDesktop/CanipApp/issues/40)) (rascunho de classes/interfaces); apoiar testes de chamadas à API. |
| **Gabriel** | Mini design system: paleta, tipografia, componentes base ([#42](https://github.com/CanillDesktop/CanipApp/issues/42)); wireframes das telas críticas (login, shell principal, listagens); lista de ícones necessários e 1º lote de assets ([#15](https://github.com/CanillDesktop/CanipApp/issues/15)); banner/splash inicial (rascunho). |

### 2ª quinzena — Data: 05/05/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Implementar/completar endpoints que faltem para listagens e cadastros usados pelo app; DTOs/mappers; tratamento de erro padronizado no servidor. |
| **Mateus** | Primeira versão da base de ViewModel para CRUD com abas ([#40](https://github.com/CanillDesktop/CanipApp/issues/40)); integrar com uma entidade piloto; revisar bindings com Gabriel. |
| **Gabriel** | Serviços de API no frontend ([#38](https://github.com/CanillDesktop/CanipApp/issues/38)); conectar telas piloto aos endpoints; aplicar estilos do design system nas telas tocadas. |

### 3ª quinzena — Data: 19/05/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Avançar configuração **AWS Cognito** ([#35](https://github.com/CanillDesktop/CanipApp/issues/35)): pools, fluxos, políticas; expor o que o app precisa (URLs, escopos, claims); documentar variáveis de ambiente. |
| **Mateus** | Apoiar fluxo de autenticação no app (armazenamento seguro de token, refresh se houver); esboço de **login offline** ([#14](https://github.com/CanillDesktop/CanipApp/issues/14)) — escopo e limites; testes com Arthur. |
| **Gabriel** | Navegação **pós-login e pós-cadastro** ([#37](https://github.com/CanillDesktop/CanipApp/issues/37)); telas de loading/empty states; integrar login com serviços; aplicar ícones nas entradas principais do menu. |

### 4ª quinzena — Data: 02/06/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Integração Cognito ↔ API (autorização nas rotas); revisão de segurança básica (CORS, validação de entrada); logs úteis para depuração. |
| **Mateus** | Consolidar ViewModels das entidades restantes com a base de abas; consistência de comandos (salvar/cancelar/recarregar); testes manuais guiados. |
| **Gabriel** | Melhorar **validação de formulários** ([#41](https://github.com/CanillDesktop/CanipApp/issues/41)); feedback visual em campos; revisão de usabilidade com Mateus. |

### 5ª quinzena — Data: 16/06/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Endpoints ou agregações para **consultas especiais** que o frontend precise ([#34](https://github.com/CanillDesktop/CanipApp/issues/34)); paginação/filtros no servidor quando aplicável. |
| **Mateus** | Modelagem de estados de tela (carregando, vazio, erro) nos ViewModels; apoiar padronização com Gabriel. |
| **Gabriel** | Padronizar **mensagens de sucesso/erro e loading** ([#39](https://github.com/CanillDesktop/CanipApp/issues/39)); componente ou serviço de toast/dialog alinhado ao design system; banners para telas de relatório/consulta, se aplicável. |

### 6ª quinzena — Data: 30/06/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Backend para indicadores de **produtos** (baixo, sem movimentação, giro) — [#31](https://github.com/CanillDesktop/CanipApp/issues/31); contratos JSON estáveis. |
| **Mateus** | ViewModels para telas de indicadores; mapeamento dos DTOs; testes com dados extremos (zero, nulo, períodos sem movimento). |
| **Gabriel** | **Novas abas e filtros** para essas consultas ([#34](https://github.com/CanillDesktop/CanipApp/issues/34)); gráficos/tabelas conforme padrão visual; ícones por tipo de alerta. |

### 7ª quinzena — Data: 14/07/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Backend **insumos**: estoque crítico e projeção de consumo ([#32](https://github.com/CanillDesktop/CanipApp/issues/32)); validar regras com stakeholders se necessário. |
| **Mateus** | Integração das novas consultas no app; performance (evitar chamadas redundantes); checklist de regressão. |
| **Gabriel** | Telas de insumos com filtros e visualização clara; banners ou cabeçalhos informativos; ajustes de UX. |

### 8ª quinzena — Data: 28/07/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Backend **estoque geral**: vencimento / sem movimentação para todas as entidades ([#33](https://github.com/CanillDesktop/CanipApp/issues/33)); otimizações simples (índices/consultas). |
| **Mateus** | Unificar padrão de listagens especiais no app; documentar fluxos para o relatório quinzenal. |
| **Gabriel** | Polimento visual global ([#42](https://github.com/CanillDesktop/CanipApp/issues/42)); fechar pacote de **ícones** e substituir placeholders ([#15](https://github.com/CanillDesktop/CanipApp/issues/15)); revisão básica de acessibilidade (tamanhos, contraste). |

### 9ª quinzena — Data: 11/08/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Testes de carga leves, revisão de segurança básica; documentação de deploy e variáveis; orientação sobre estimativa de custos AWS para a instituição. |
| **Mateus** | Testes integrados finais backend-app; cenários local vs nuvem; suporte a bugs cruzados. |
| **Gabriel** | **Empacotamento**, build de release, ícones do app e assets finais ([#36](https://github.com/CanillDesktop/CanipApp/issues/36)); rodada de QA de UI; correção de bugs de layout/navegação. |

### 10ª quinzena — Data: 25/08/2026

| Nome | Atividade |
|------|-----------|
| **Arthur** | Congelamento de escopo; últimos ajustes de API; roteiro de **treinamento** para a secretaria (uso do sistema e limites de manutenção). |
| **Mateus** | Documentação técnica resumida (arquitetura, fluxo de dados, autenticação/offline se entregue); checklist final de entrega. |
| **Gabriel** | Revisão final de UX, consistência de ícones e banners, mensagens; capturas de tela para apresentação/relatório; apoio na demo para a instituição. |

---

## VII. Comunicação

- Reuniões semanais da equipe (ex.: Discord).
- Contato pontual entre membros quando necessário (ex.: WhatsApp).
- Comunicação com a instituição pelos canais oficiais acordados (telefone/e-mail da secretaria).

---

## VIII. Recursos

- Três desenvolvedores e equipamentos próprios.
- Ferramentas: Visual Studio / VS Code, Git, Discord, serviços AWS conforme o projeto.
- Instituição: pelo menos um computador para uso operacional e orçamento para manter serviços em nuvem em produção, quando aplicável.

---

## IX. Monitoramento e controle

- Reuniões semanais com briefing de progresso e dificuldades.
- Checklist do que cada membro concluiu na quinzena.
- **Relatório quinzenal** entregue conforme orientação do professor (ex.: Drive).
- Acompanhamento pelo líder da equipe e pelo orientador.
- Critério de sucesso: soma do feedback da instituição, do professor e da qualidade técnica das entregas (código, testes, documentação).

---

*Documento gerado para alinhamento com o modelo PIEX e com o backlog do repositório CanipApp. Atualize datas e dados institucionais conforme o calendário e acordos vigentes.*
