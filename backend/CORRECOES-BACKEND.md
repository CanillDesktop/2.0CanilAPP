# Correções no Backend — Busca, Retirada de Estoque e Timezone

Documentação das correções aplicadas em junho/2026: causas raiz, soluções implementadas e arquivos alterados.

---

## Índice

1. [Pesquisa case-insensitive](#1-pesquisa-case-insensitive)
2. [Erro na retirada de Medicamentos](#2-erro-na-retirada-de-medicamentos)
3. [Data da retirada com +3 horas](#3-data-da-retirada-com-3-horas)
4. [Arquivos criados e alterados](#4-arquivos-criados-e-alterados)
5. [Como validar](#5-como-validar)

---

## 1. Pesquisa case-insensitive

### Sintoma

Nas páginas de **Produtos**, **Medicamentos**, **Insumos**, **Estoque** e **Dashboard**, a busca por texto não encontrava registros quando a capitalização diferia.

| Cadastro      | Busca por   | Resultado antes da correção |
|---------------|-------------|-----------------------------|
| `BactoPet`    | `Bacto`     | Encontrava                  |
| `BactoPet`    | `bactopet`  | **Não encontrava**          |

### Causa raiz

Os filtros paginados usavam `string.Contains(termo)` diretamente nas expressões LINQ traduzidas para SQL pelo Entity Framework:

- `FiltroHelper.AplicarFiltrosProdutos`
- `FiltroHelper.AplicarFiltrosMedicamentos`
- `FiltroHelper.AplicarFiltrosInsumos`
- `EstoqueConsultaQueryable.AplicarTermoBusca*`

O `Contains` do EF gera `LIKE` no SQL. Dependendo do collation/banco, a comparação pode ser case-sensitive. Além disso, campos como `DescricaoSimples` são gravados em minúsculas no cadastro, enquanto `NomeComercial` (medicamentos) é gravado em maiúsculas — o comportamento ficava inconsistente entre entidades.

O **Dashboard** já filtrava alertas em memória com `StringComparison.OrdinalIgnoreCase`, mas Produtos/Medicamentos/Insumos/Estoque não tinham equivalente no SQL.

Não existia utilitário compartilhado; a lógica estava duplicada em dois pontos (`FiltroHelper` e `EstoqueConsultaQueryable`).

### Solução

1. Criado **`TermoBuscaQueryable`** (`Filtro/Helpers/TermoBuscaQueryable.cs`) para normalizar o termo uma vez (`Trim` + `ToLowerInvariant`).
2. Filtros passaram a usar o padrão traduzível pelo EF Core:

   ```csharp
   campo.ToLower().Contains(termoNormalizado)
   ```

   O termo é normalizado **fora** da expressão LINQ; os campos usam `.ToLower()` **dentro** — traduz para SQL sem materializar a lista em memória.

3. Mesmo helper reutilizado no histórico de retiradas (`RetiradaEstoqueConsultaQueryable`), eliminando duplicação.

### Por que não `StringComparison.OrdinalIgnoreCase`?

`string.Contains(termo, StringComparison.OrdinalIgnoreCase)` **não é traduzido** para SQL pelo EF Core na maioria dos providers — forçaria `AsEnumerable()` e traria todos os registros para memória. A abordagem `ToLower().Contains()` é a compatível com SQLite + EF usada no projeto.

---

## 2. Erro na retirada de Medicamentos

### Sintoma

- Retirada de **Produtos** → funcionava.
- Retirada de **Medicamentos** → falha no `POST /api/RetiradaEstoque/{lote}`.

### Causa raiz

O fluxo de retirada é **único** para todos os tipos de item (Produtos, Medicamentos, Insumos). Não há controller ou service separado por tipo. A diferença estava nos **dados** e na **configuração do EF**, não em regra de negócio distinta.

#### 2.1 — Lookup por `Codigo + Lote` com código vazio no estoque

O serviço buscava o lote assim:

```csharp
.Where(e => e.Lote == dto.Lote && e.Codigo == dto.Codigo && !e.IsDeleted)
```

A migration `20260425215627_CorrecoesEmInsumosENosNomesDeAlgunsCampos` renomeou `ItensEstoque.CodItem` → `EditadorPor` e **adicionou** a coluna `Codigo` com `defaultValue: ""`, **sem copiar** os códigos existentes dos itens pai.

Lotes criados **antes** dessa migration ficaram com `ItensEstoque.Codigo = ""`. O frontend enviava corretamente o código do medicamento (`MED…`), mas a query exigia match exato na coluna vazia → erro 400 (“item não encontrado”) ou 422 (“código não corresponde ao lote”).

Medicamentos tendem a ser afetados com mais frequência por serem cadastros mais antigos ou migrados; produtos criados depois da migration já tinham `Codigo` preenchido na criação.

#### 2.2 — Herança TPT incompleta no `DbContext`

O modelo usa **Table Per Type (TPT)** com `ItemComEstoqueBaseModel` como base. As migrations já declaravam `HasBaseType` para Produtos, Medicamentos e Insumos, mas o `CanilAppDbContext` registrava apenas:

```csharp
modelBuilder.Entity<ProdutosModel>().HasBaseType<ItemComEstoqueBaseModel>();
```

Faltavam `MedicamentosModel` e `InsumosModel`. Após esgotar o último lote, o service faz soft-delete do item pai via:

```csharp
_context.Set<ItemComEstoqueBaseModel>().FirstOrDefaultAsync(p => p.Id == chave.Id ...)
```

Sem TPT completo, medicamentos/insumos podiam não ser encontrados ou gerar falha na persistência — sintoma típico: erro 500 após a baixa de quantidade.

#### 2.3 — Lotes vencidos (comportamento esperado, não bug)

Medicamentos costumam ter `DataValidade`. Se o lote está vencido e o cliente **não** envia `confirmarLoteVencido: true`, o backend retorna **409 Conflict** (`LoteVencidoPrecisaConfirmacaoException`). Produtos sem validade não passam por essa validação — pode parecer que “só medicamentos falham”.

### Solução

1. **Lookup por lote** (índice único global em `ItensEstoque.Lote`), não mais por `Codigo + Lote`.
2. **Validação do código** contra o item pai (`Produtos`, `Medicamentos` ou `Insumos`) via `ResolverCodigoItemAsync`.
3. Se `ItensEstoque.Codigo` estiver vazio, usa o código do pai; na baixa, **preenche** o código no lote (`ExecuteUpdate` com `SetProperty(e => e.Codigo, …)`).
4. Registrado `HasBaseType<ItemComEstoqueBaseModel>()` para **Medicamentos** e **Insumos** no `CanilAppDbContext`.
5. Migration **`BackfillItensEstoqueCodigo`** com SQL que copia `Codigo` do item pai para lotes legados com código vazio.

---

## 3. Data da retirada com +3 horas

### Sintoma

A data/hora da retirada aparecia **3 horas à frente** do horário esperado no Brasil (UTC−3). O campo que deveria representar UTC também parecia “errado” na interface.

### Causa raiz

A **gravação** estava correta: `RetiradaEstoqueService.CriarAsync` define `dto.DataHoraRetirada = DateTime.UtcNow` e ignora o valor enviado pelo cliente (auditoria).

O problema estava no **ciclo leitura → API → frontend**:

```
UtcNow (15:00 UTC = 12:00 BRT)
    ↓ SQLite persiste como TEXT
    ↓ EF lê como DateTimeKind.Unspecified (15:00 sem Kind)
    ↓ JSON serializa sem "Z" → "2026-06-17T15:00:00"
    ↓ JavaScript: new Date("...") trata sem offset como horário LOCAL
    ↓ Intl com America/Sao_Paulo exibe 15:00 em vez de 12:00 → +3h
```

Não havia conversão dupla no backend na gravação. O deslocamento vinha da **perda do `DateTimeKind`** no SQLite e da **serialização JSON sem indicador UTC**.

Exportações XLSX/CSV já convertiam explicitamente (`SpecifyKind` + `ConvertTimeFromUtc`) e podiam parecer corretas enquanto a API JSON exibia errado.

### Solução

1. **`UtcDateTimeValueConverter`** (EF Core): em todas as propriedades `DateTime`/`DateTime?`, na leitura aplica `DateTime.SpecifyKind(..., Utc)`; na escrita garante UTC.
2. **`UtcDateTimeJsonConverter`** (System.Text.Json): serializa com formato ISO 8601 e sufixo **`Z`**; na deserialização restaura `Kind=Utc`.
3. Conversores registrados em `CanilAppDbContext.OnModelCreating` e em `Program.cs` (`AddJsonOptions`).

Com isso, a API passa a responder, por exemplo:

```json
"dataHoraRetirada": "2026-06-17T15:00:00.0000000Z"
```

O frontend interpreta corretamente como UTC e pode exibir 12:00 em Brasília.

---

## 4. Arquivos criados e alterados

### Criados

| Arquivo | Função |
|---------|--------|
| `Filtro/Helpers/TermoBuscaQueryable.cs` | Normalização centralizada de termo de busca |
| `Serialization/UtcDateTimeJsonConverter.cs` | JSON UTC (`DateTime` e `DateTime?`) |
| `Context/UtcDateTimeValueConverter.cs` | Conversor EF para DateTime UTC |
| `Migrations/20260617231425_BackfillItensEstoqueCodigo.cs` | Backfill de `ItensEstoque.Codigo` |

### Alterados

| Arquivo | Alteração |
|---------|-----------|
| `Filtro/Helpers/FiltroHelper.cs` | Busca case-insensitive (Produtos, Medicamentos, Insumos) |
| `Repositories/EstoqueConsultaQueryable.cs` | Busca case-insensitive (Estoque) |
| `Repositories/RetiradaEstoqueConsultaQueryable.cs` | Uso do helper de termo |
| `Services/RetiradaEstoqueService.cs` | Lookup por lote, validação via item pai, backfill na baixa |
| `Context/CanilAppDbContext.cs` | TPT completo + conversores UTC |
| `Program.cs` | Registro dos conversores JSON |

---

## 5. Como validar

### Busca

1. Cadastre um produto com nome `BactoPet`.
2. Busque por `bactopet`, `BACTOPET`, `bacto` nas listagens de Produtos, Estoque e Dashboard.
3. Todos devem retornar o registro.

### Retirada de medicamento

1. Aplique as migrations (`dotnet run` aplica automaticamente, ou `dotnet ef database update`).
2. Registre retirada de um lote ativo de medicamento com estoque suficiente.
3. Confirme HTTP 201 Created.
4. Para lote **vencido**, envie `"confirmarLoteVencido": true` no body ou espere 409 até confirmar.

### Timezone

1. Registre uma retirada e consulte `GET /api/RetiradaEstoque/historico`.
2. Verifique que `dataHoraRetirada` termina com **`Z`**.
3. Compare com o horário local de Brasília (UTC−3): deve bater com o momento real da operação, sem +3h.

---

## Referência rápida — endpoints afetados

| Área | Endpoint / fluxo |
|------|------------------|
| Produtos | `GET /api/Produtos?termo=...` |
| Medicamentos | `GET /api/Medicamentos?termo=...` |
| Insumos | `GET /api/Insumos?termo=...` |
| Estoque | `GET /api/Estoque/pagination?termoBusca=...` |
| Dashboard | `GET /api/Dashboard/alertas?termo=...` |
| Retirada | `POST /api/RetiradaEstoque/{lote}` |
| Histórico | `GET /api/RetiradaEstoque/historico` |
