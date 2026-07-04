"""Gera seed_estoque_demo.sql alinhado ao padrão do sistema."""
from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).with_name("seed_estoque_demo.sql")

# UnidadeEstoque: 1=Secretaria, 2=Canil
SEC, CAN = 1, 2

# CategoriaEnum (começa em 1)
CAT = {
    "ACESSORIO": 1,
    "ALIMENTO": 2,
    "HIGIENE": 6,
    "LIMPEZA": 8,
    "MATERIAL_HOSPITALAR": 9,
    "VESTUARIO": 12,
    "VETERINARIO": 13,
}
CAT_DESC = {
    1: "Acessórios",
    2: "Alimentação",
    6: "Higiene",
    8: "Limpeza",
    9: "Material Hospitalar",
    12: "Vestuário",
    13: "Veterinário",
}

# PrioridadeEnum / PublicoAlvoMedicamentoEnum (começam em 0)
PRIO = {"Baixa": 0, "Media": 1, "Alta": 2}
PUB = {"Animal": 0, "HumanoEAnimal": 1}

# UnidadesMedida (ids do catálogo)
UM = {
    "UN": 1, "CX": 2, "KG": 3, "PCT": 4, "L": 5,
    "Ampola": 6, "Comprimido": 7, "Frasco": 8,
    "Bandeja": 9, "Barra": 10, "Galao": 11, "Kit": 12,
    "Par": 13, "Peca": 14, "Rolo": 15, "Tubo": 16, "Vidro": 17,
    "g": 18, "ml": 19, "m": 20, "cm": 21,
}


def norm(texto: str) -> str:
    mapa = str.maketrans(
        "ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ",
        "AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn",
    )
    s = texto.translate(mapa)
    return "".join(c.upper() for c in s if c.isalnum())


def primeiras(texto: str, n: int) -> str:
    s = norm(texto)
    return (s[:n] if len(s) >= n else s.ljust(n, "X"))


def sql_str(v: str | None) -> str:
    if v is None:
        return "NULL"
    return "'" + v.replace("'", "''") + "'"


def sql_dt(v: str | None) -> str:
    return "NULL" if v is None else sql_str(v)


# Contadores de lote por tipo
seq = {"PRO": 0, "INS": 0, "MED": 0}


def next_lote_produto(categoria: int, descricao: str) -> str:
    seq["PRO"] += 1
    return f"PRO{primeiras(CAT_DESC[categoria], 2)}{primeiras(descricao, 3)}{seq['PRO']:06d}"


def next_lote_insumo(descricao: str) -> str:
    seq["INS"] += 1
    return f"INS{primeiras(descricao, 6)}{seq['INS']:06d}"


def next_lote_med(publico: int, nome: str) -> str:
    seq["MED"] += 1
    token = "T" if publico == PUB["HumanoEAnimal"] else "A"
    return f"MED{token}{primeiras(nome, 3)}{seq['MED']:06d}"


# Itens: (tipo, unidade_estoque, campos específicos, niveis, lotes)
# lote: (qtd_entrada, qtd_retirada, tipo_entrada 1=compra 2=doacao, validade, nfe/doador)

produtos = [
    # Secretaria
    dict(id=1, un=SEC, nome="ração super premium adulto", det="ração completa para cães adultos, com proteínas de alta digestibilidade.", um=UM["KG"], cat=CAT["ALIMENTO"], nivel=20, lotes=[
        (80, 15, 1, "2027-06-15 00:00:00", "NFe-2026-1001"),
        (50, 0, 1, "2027-09-01 00:00:00", "NFe-2026-1002"),
        (30, 10, 2, "2027-03-20 00:00:00", None),
    ]),
    dict(id=2, un=SEC, nome="shampoo neutro pet", det="shampoo de uso frequente para peles sensíveis, ph balanceado.", um=UM["UN"], cat=CAT["HIGIENE"], nivel=10, lotes=[
        (40, 8, 1, "2028-01-10 00:00:00", "NFe-2026-1003"),
        (25, 0, 1, "2028-04-01 00:00:00", "NFe-2026-1004"),
    ]),
    dict(id=3, un=SEC, nome="coleira antipulgas", det="coleira de liberação prolongada contra pulgas e carrapatos.", um=UM["UN"], cat=CAT["ACESSORIO"], nivel=5, lotes=[
        (20, 5, 1, "2028-12-01 00:00:00", "NFe-2026-1005"),
    ]),
    dict(id=4, un=SEC, nome="areia higiênica biodegradável", det="areia absorvente biodegradável para caixas de areia.", um=UM["PCT"], cat=CAT["HIGIENE"], nivel=15, lotes=[
        (60, 12, 1, "2027-11-01 00:00:00", "NFe-2026-1006"),
        (40, 0, 1, "2028-02-15 00:00:00", "NFe-2026-1007"),
        (35, 5, 2, "2027-08-20 00:00:00", None),
        (20, 0, 1, "2028-05-01 00:00:00", "NFe-2026-1008"),
    ]),
    dict(id=5, un=SEC, nome="álcool 70%", det="álcool etílico 70% para desinfecção de superfícies e materiais.", um=UM["L"], cat=CAT["LIMPEZA"], nivel=8, lotes=[
        (30, 6, 1, "2028-06-01 00:00:00", "NFe-2026-1009"),
        (20, 0, 1, "2028-09-01 00:00:00", "NFe-2026-1010"),
    ]),
    dict(id=6, un=SEC, nome="luva de procedimento", det="luva de procedimento descartável para atendimento clínico.", um=UM["CX"], cat=CAT["MATERIAL_HOSPITALAR"], nivel=12, lotes=[
        (50, 10, 1, "2029-01-01 00:00:00", "NFe-2026-1011"),
        (40, 0, 1, "2029-03-01 00:00:00", "NFe-2026-1012"),
        (25, 5, 2, "2028-12-01 00:00:00", None),
    ]),
    # Canil
    dict(id=7, un=CAN, nome="ração filhote premium", det="ração para filhotes em crescimento, com dha e cálcio.", um=UM["KG"], cat=CAT["ALIMENTO"], nivel=25, lotes=[
        (100, 20, 1, "2027-05-01 00:00:00", "NFe-2026-2001"),
        (70, 0, 1, "2027-08-01 00:00:00", "NFe-2026-2002"),
        (40, 10, 2, "2027-02-15 00:00:00", None),
    ]),
    dict(id=8, un=CAN, nome="tapete higiênico", det="tapete absorvente para treinamento e higiene de filhotes.", um=UM["PCT"], cat=CAT["HIGIENE"], nivel=18, lotes=[
        (80, 15, 1, "2028-01-01 00:00:00", "NFe-2026-2003"),
        (50, 0, 1, "2028-04-01 00:00:00", "NFe-2026-2004"),
    ]),
    dict(id=9, un=CAN, nome="brinquedo mordedor", det="brinquedo de borracha resistente para enriquecimento ambiental.", um=UM["UN"], cat=CAT["ACESSORIO"], nivel=6, lotes=[
        (30, 8, 2, "2029-01-01 00:00:00", None),
    ]),
    dict(id=10, un=CAN, nome="desinfetante hospitalar", det="desinfetante de uso veterinário para baias e áreas comuns.", um=UM["L"], cat=CAT["LIMPEZA"], nivel=10, lotes=[
        (40, 10, 1, "2028-07-01 00:00:00", "NFe-2026-2005"),
        (25, 0, 1, "2028-10-01 00:00:00", "NFe-2026-2006"),
    ]),
    dict(id=11, un=CAN, nome="cobertor pet", det="cobertor macio para abrigo e conforto térmico dos animais.", um=UM["UN"], cat=CAT["VESTUARIO"], nivel=8, lotes=[
        (20, 4, 2, "2029-06-01 00:00:00", None),
    ]),
    dict(id=12, un=CAN, nome="comedouro inox", det="comedouro de aço inoxidável, fácil higienização.", um=UM["UN"], cat=CAT["ACESSORIO"], nivel=5, lotes=[
        (15, 3, 1, "2030-01-01 00:00:00", "NFe-2026-2007"),
        (10, 0, 1, "2030-01-01 00:00:00", "NFe-2026-2008"),
    ]),
]

medicamentos = [
    # Secretaria
    dict(id=13, un=SEC, nome="BACTOPET", formula="Amoxicilina + Clavulanato", desc="antibiótico de amplo espectro para infecções bacterianas.", um=UM["Comprimido"], prio=PRIO["Alta"], pub=PUB["Animal"], nivel=30, lotes=[
        (100, 20, 1, "2028-04-01 00:00:00", "NFe-MED-3001"),
        (80, 0, 1, "2028-08-01 00:00:00", "NFe-MED-3002"),
        (50, 10, 2, "2027-12-01 00:00:00", None),
    ]),
    dict(id=14, un=SEC, nome="DIPIRONA GOTAS", formula="Dipirona monoidratada", desc="analgésico e antitérmico de uso humano e animal.", um=UM["ml"], prio=PRIO["Media"], pub=PUB["HumanoEAnimal"], nivel=20, lotes=[
        (60, 12, 1, "2028-02-01 00:00:00", "NFe-MED-3003"),
        (40, 0, 1, "2028-06-01 00:00:00", "NFe-MED-3004"),
    ]),
    dict(id=15, un=SEC, nome="IVERMECTINA", formula="Ivermectina 1%", desc="antiparasitário para controle de endo e ectoparasitas.", um=UM["ml"], prio=PRIO["Alta"], pub=PUB["Animal"], nivel=15, lotes=[
        (45, 10, 1, "2027-10-01 00:00:00", "NFe-MED-3005"),
    ]),
    dict(id=16, un=SEC, nome="VACINA V10", formula="Vacina polivalente canina", desc="vacina polivalente para imunização de cães.", um=UM["Frasco"], prio=PRIO["Alta"], pub=PUB["Animal"], nivel=25, lotes=[
        (50, 8, 1, "2027-09-01 00:00:00", "NFe-MED-3006"),
        (30, 0, 1, "2028-01-01 00:00:00", "NFe-MED-3007"),
    ]),
    dict(id=17, un=SEC, nome="CICATRIZAN", formula="Óxido de zinco + alantoína", desc="pomada cicatrizante para feridas superficiais.", um=UM["Frasco"], prio=PRIO["Baixa"], pub=PUB["Animal"], nivel=10, lotes=[
        (25, 5, 2, "2028-05-01 00:00:00", None),
        (20, 0, 1, "2028-11-01 00:00:00", "NFe-MED-3008"),
    ]),
    # Canil
    dict(id=18, un=CAN, nome="VERMIGUARD", formula="Praziquantel + Pirantel + Febantel", desc="vermífugo oral para controle de nematodas e cestodas.", um=UM["Comprimido"], prio=PRIO["Media"], pub=PUB["Animal"], nivel=40, lotes=[
        (120, 30, 1, "2028-03-01 00:00:00", "NFe-MED-4001"),
        (90, 0, 1, "2028-07-01 00:00:00", "NFe-MED-4002"),
        (60, 15, 2, "2027-11-01 00:00:00", None),
    ]),
    dict(id=19, un=CAN, nome="ECTOSHIELD", formula="Fipronil 10%", desc="antiparasitário tópico para pulgas e carrapatos.", um=UM["ml"], prio=PRIO["Alta"], pub=PUB["Animal"], nivel=20, lotes=[
        (40, 8, 1, "2028-04-15 00:00:00", "NFe-MED-4003"),
        (30, 0, 1, "2028-09-15 00:00:00", "NFe-MED-4004"),
    ]),
    dict(id=20, un=CAN, nome="SORO FISIOLOGICO", formula="Cloreto de sódio 0,9%", desc="solução fisiológica para limpeza e diluição.", um=UM["ml"], prio=PRIO["Baixa"], pub=PUB["HumanoEAnimal"], nivel=50, lotes=[
        (200, 40, 1, "2028-01-01 00:00:00", "NFe-MED-4005"),
        (150, 0, 1, "2028-05-01 00:00:00", "NFe-MED-4006"),
        (100, 20, 2, "2027-12-01 00:00:00", None),
        (80, 0, 1, "2028-08-01 00:00:00", "NFe-MED-4007"),
    ]),
    dict(id=21, un=CAN, nome="MELOXICAM", formula="Meloxicam 0,5 mg", desc="anti-inflamatório não esteroidal para dor e inflamação.", um=UM["Comprimido"], prio=PRIO["Media"], pub=PUB["Animal"], nivel=15, lotes=[
        (35, 7, 1, "2028-02-01 00:00:00", "NFe-MED-4008"),
    ]),
    dict(id=22, un=CAN, nome="ENROFLOXACINA", formula="Enrofloxacina 5%", desc="antibiótico injetável de amplo espectro.", um=UM["Ampola"], prio=PRIO["Alta"], pub=PUB["Animal"], nivel=12, lotes=[
        (30, 6, 1, "2027-12-15 00:00:00", "NFe-MED-4009"),
        (20, 0, 1, "2028-06-15 00:00:00", "NFe-MED-4010"),
    ]),
]

insumos = [
    # Secretaria
    dict(id=23, un=SEC, nome="agulha hipodérmica 25x7", det="agulha para aplicação subcutânea e intramuscular.", um=UM["UN"], nivel=50, lotes=[
        (200, 40, 1, "2029-01-01 00:00:00", "NFe-INS-5001"),
        (150, 0, 1, "2029-04-01 00:00:00", "NFe-INS-5002"),
        (100, 20, 2, "2028-12-01 00:00:00", None),
    ]),
    dict(id=24, un=SEC, nome="luva nitrílica sem pó", det="luva de procedimento nitrílica, sem pó, tamanho m.", um=UM["CX"], nivel=20, lotes=[
        (40, 8, 1, "2029-02-01 00:00:00", "NFe-INS-5003"),
        (30, 0, 1, "2029-05-01 00:00:00", "NFe-INS-5004"),
    ]),
    dict(id=25, un=SEC, nome="gaze estéril 7,5x7,5", det="compressa de gaze estéril para curativos.", um=UM["PCT"], nivel=25, lotes=[
        (80, 15, 1, "2028-11-01 00:00:00", "NFe-INS-5005"),
        (60, 0, 1, "2029-02-01 00:00:00", "NFe-INS-5006"),
        (40, 10, 2, "2028-09-01 00:00:00", None),
    ]),
    dict(id=26, un=SEC, nome="seringa descartável 5ml", det="seringa descartável com bico luer slip.", um=UM["UN"], nivel=40, lotes=[
        (150, 30, 1, "2029-03-01 00:00:00", "NFe-INS-5007"),
        (100, 0, 1, "2029-06-01 00:00:00", "NFe-INS-5008"),
    ]),
    dict(id=27, un=SEC, nome="fita micropore", det="fita microporosa para fixação de curativos.", um=UM["Rolo"], nivel=10, lotes=[
        (25, 5, 1, "2029-01-01 00:00:00", "NFe-INS-5009"),
    ]),
    # Canil
    dict(id=28, un=CAN, nome="escova de banho pet", det="escova macia para banho e escovação de pelos.", um=UM["UN"], nivel=8, lotes=[
        (15, 3, 2, "2030-01-01 00:00:00", None),
    ]),
    dict(id=29, un=CAN, nome="shampoo antipulgas", det="shampoo com ação antiparasitária para banho no canil.", um=UM["Frasco"], nivel=12, lotes=[
        (30, 6, 1, "2028-08-01 00:00:00", "NFe-INS-6001"),
        (20, 0, 1, "2028-12-01 00:00:00", "NFe-INS-6002"),
    ]),
    dict(id=30, un=CAN, nome="papel toalha industrial", det="rolo de papel toalha para higiene das baias.", um=UM["Rolo"], nivel=15, lotes=[
        (50, 10, 1, "2028-10-01 00:00:00", "NFe-INS-6003"),
        (40, 0, 1, "2029-01-01 00:00:00", "NFe-INS-6004"),
        (30, 5, 2, "2028-07-01 00:00:00", None),
    ]),
    dict(id=31, un=CAN, nome="detergente neutro", det="detergente neutro concentrado para limpeza geral.", um=UM["Galao"], nivel=6, lotes=[
        (12, 2, 1, "2028-09-01 00:00:00", "NFe-INS-6005"),
        (10, 0, 1, "2029-01-01 00:00:00", "NFe-INS-6006"),
    ]),
    dict(id=32, un=CAN, nome="kit primeiros socorros", det="kit básico de primeiros socorros para emergências no canil.", um=UM["Kit"], nivel=3, lotes=[
        (5, 1, 1, "2029-06-01 00:00:00", "NFe-INS-6007"),
    ]),
]

# Usuários existentes no banco
USERS = {
    1: "Arthur Galdino",
    2: "mateus thomaz",
    5: "maria",
}

FORNECEDORES = [
    ("AgroPet Distribuidora LTDA", "12.345.678/0001-90"),
    ("VetSupply Brasil", "98.765.432/0001-10"),
    ("Farmácia Veterinária Central", "11.222.333/0001-44"),
]
DOADORES = [
    ("Associação Amigos dos Animais", "45.678.901/0001-22"),
    ("Campanha Solidária Municipal", None),
    ("Doação anônima", None),
]


def build() -> str:
    lines: list[str] = []
    a = lines.append

    a("-- =============================================================================")
    a("-- Seed de estoque demo (SQLite) — CanilApp")
    a("-- Limpa itens/estoque/histórico e recarrega dados realistas.")
    a("-- Preserva: Usuarios, UnidadesEstoque, UsuariosUnidadesEstoque, CodigoAcesso.")
    a("--")
    a("-- Pressupõe schema já alinhado (UnidadesMedida + Medicamentos.Unidade).")
    a("-- Pode rodar quantas vezes quiser: limpa e recarrega o estoque demo.")
    a("-- =============================================================================")
    a("")
    a("PRAGMA foreign_keys = OFF;")
    a("BEGIN TRANSACTION;")
    a("")

    # --- Schema alignment ---
    a("-- ---------------------------------------------------------------------------")
    a("-- 1) Catálogo de unidades de medida (recria os registros do catálogo)")
    a("-- ---------------------------------------------------------------------------")
    a("""
CREATE TABLE IF NOT EXISTS UnidadesMedida (
    Id INTEGER NOT NULL CONSTRAINT PK_UnidadesMedida PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Sigla TEXT NULL,
    AplicavelProduto INTEGER NOT NULL,
    AplicavelMedicamento INTEGER NOT NULL,
    AplicavelInsumo INTEGER NOT NULL,
    Ativa INTEGER NOT NULL,
    DataHoraCriacao TEXT NOT NULL,
    DataHoraAtualizacao TEXT NOT NULL,
    EditadorPor TEXT NOT NULL,
    IsDeleted INTEGER NOT NULL
);
""".strip())
    a("")
    a("DELETE FROM UnidadesMedida;")
    a("""
INSERT INTO UnidadesMedida (Id, Nome, Sigla, AplicavelProduto, AplicavelMedicamento, AplicavelInsumo, Ativa, DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted) VALUES
(1, 'Unidade', 'UN', 1, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(2, 'Caixa', 'CX', 1, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(3, 'Quilo', 'KG', 1, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(4, 'Pacote', 'PCT', 1, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(5, 'Litro', 'L', 1, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(6, 'Ampola', NULL, 0, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(7, 'Comprimido', NULL, 0, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(8, 'Frasco', NULL, 0, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(9, 'Bandeja', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(10, 'Barra', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(11, 'Galão', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(12, 'Kit', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(13, 'Par', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(14, 'Peça', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(15, 'Rolo', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(16, 'Tubo', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(17, 'Vidro', NULL, 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(18, 'Grama', 'g', 0, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(19, 'Mililitro', 'ml', 0, 1, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(20, 'Metro', 'm', 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0),
(21, 'Centímetros', 'cm', 0, 0, 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0);
""".strip())
    a("")

    # --- Cleanup ---
    a("-- ---------------------------------------------------------------------------")
    a("-- 2) Limpeza dos dados de estoque / itens / histórico")
    a("-- ---------------------------------------------------------------------------")
    a("DELETE FROM MovimentacoesEstoque;")
    a("DELETE FROM RetiradaEstoque;")
    a("DELETE FROM TransferenciasEstoqueItens;")
    a("DELETE FROM TransferenciasEstoque;")
    a("DELETE FROM ItensEstoque;")
    a("DELETE FROM ItensNivelEstoque;")
    a("DELETE FROM ContadoresLote;")
    a("DELETE FROM Produtos;")
    a("DELETE FROM Medicamentos;")
    a("DELETE FROM Insumos;")
    a("DELETE FROM ItensBase;")
    a("")
    a("DELETE FROM sqlite_sequence WHERE name IN (")
    a("  'ItensBase','MovimentacoesEstoque','RetiradaEstoque',")
    a("  'TransferenciasEstoque','TransferenciasEstoqueItens','UnidadesMedida'")
    a(");")
    a("")

    now = "2026-07-04 12:00:00"
    editor = "Sistema"

    # Precompute lotes and codes
    item_meta: dict[int, dict] = {}

    for p in produtos:
        codigo = f"PRD{primeiras(CAT_DESC[p['cat']], 3)}{p['id']:04d}"
        lotes = []
        for ent, ret, tipo_ent, validade, doc in p["lotes"]:
            lote = next_lote_produto(p["cat"], p["nome"])
            lotes.append(dict(lote=lote, ent=ent, ret=ret, tipo_ent=tipo_ent, validade=validade, doc=doc))
        item_meta[p["id"]] = dict(
            tipo="produto", codigo=codigo, nome=p["nome"], un=p["un"], um=p["um"],
            cat=p["cat"], det=p["det"], nivel=p["nivel"], lotes=lotes,
        )

    for m in medicamentos:
        codigo = f"MED{m['id']:04d}"
        lotes = []
        for ent, ret, tipo_ent, validade, doc in m["lotes"]:
            lote = next_lote_med(m["pub"], m["nome"])
            lotes.append(dict(lote=lote, ent=ent, ret=ret, tipo_ent=tipo_ent, validade=validade, doc=doc))
        item_meta[m["id"]] = dict(
            tipo="medicamento", codigo=codigo, nome=m["nome"], un=m["un"], um=m["um"],
            formula=m["formula"], desc=m["desc"], prio=m["prio"], pub=m["pub"],
            nivel=m["nivel"], lotes=lotes,
        )

    for i in insumos:
        codigo = f"INS{i['id']:04d}"
        lotes = []
        for ent, ret, tipo_ent, validade, doc in i["lotes"]:
            lote = next_lote_insumo(i["nome"])
            lotes.append(dict(lote=lote, ent=ent, ret=ret, tipo_ent=tipo_ent, validade=validade, doc=doc))
        item_meta[i["id"]] = dict(
            tipo="insumo", codigo=codigo, nome=i["nome"], un=i["un"], um=i["um"],
            det=i["det"], nivel=i["nivel"], lotes=lotes,
        )

    a("-- ---------------------------------------------------------------------------")
    a("-- 3) Cadastro de itens (ItensBase + especialização)")
    a("-- ---------------------------------------------------------------------------")
    for iid, meta in item_meta.items():
        a(f"INSERT INTO ItensBase (Id, DataHoraCriacao, DataHoraAtualizacao, IsDeleted, EditadorPor)")
        a(f"VALUES ({iid}, '{now}', '{now}', 0, {sql_str(editor)});")

    a("")
    a("-- Produtos (descrições em minúsculo, como o sistema grava)")
    for p in produtos:
        meta = item_meta[p["id"]]
        a(
            "INSERT INTO Produtos (Id, Categoria, Codigo, DescricaoDetalhada, DescricaoSimples, Unidade) VALUES "
            f"({p['id']}, {p['cat']}, {sql_str(meta['codigo'])}, {sql_str(p['det'])}, {sql_str(p['nome'])}, {p['um']});"
        )

    a("")
    a("-- Medicamentos (NomeComercial em maiúsculo)")
    for m in medicamentos:
        meta = item_meta[m["id"]]
        a(
            "INSERT INTO Medicamentos (Id, Codigo, Descricao, Formula, NomeComercial, Prioridade, PublicoAlvo, Unidade) VALUES "
            f"({m['id']}, {sql_str(meta['codigo'])}, {sql_str(m['desc'])}, {sql_str(m['formula'])}, "
            f"{sql_str(m['nome'])}, {m['prio']}, {m['pub']}, {m['um']});"
        )

    a("")
    a("-- Insumos")
    for i in insumos:
        meta = item_meta[i["id"]]
        a(
            "INSERT INTO Insumos (Id, Codigo, DescricaoDetalhada, DescricaoSimplificada, Unidade) VALUES "
            f"({i['id']}, {sql_str(meta['codigo'])}, {sql_str(i['det'])}, {sql_str(i['nome'])}, {i['um']});"
        )

    a("")
    a("-- ---------------------------------------------------------------------------")
    a("-- 4) Nível mínimo por unidade (item só existe na unidade indicada)")
    a("-- ---------------------------------------------------------------------------")
    for iid, meta in item_meta.items():
        a(
            "INSERT INTO ItensNivelEstoque (Id, IdUnidadeEstoque, DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted, NivelMinimoEstoque) VALUES "
            f"({iid}, {meta['un']}, '{now}', '{now}', {sql_str(editor)}, 0, {meta['nivel']});"
        )

    a("")
    a("-- ---------------------------------------------------------------------------")
    a("-- 5) Lotes em estoque + histórico de entradas e retiradas")
    a("-- ---------------------------------------------------------------------------")

    mov_id = 0
    ret_id = 0
    fi = 0
    di = 0

    # Datas escalonadas
    entr_dates = [
        "2026-03-10 10:00:00",
        "2026-04-05 14:30:00",
        "2026-05-12 09:15:00",
        "2026-06-01 11:45:00",
        "2026-06-20 16:00:00",
    ]
    ret_dates = [
        "2026-04-20 15:00:00",
        "2026-05-18 10:30:00",
        "2026-06-10 13:20:00",
        "2026-06-28 17:10:00",
        "2026-07-02 09:40:00",
    ]

    for iid, meta in item_meta.items():
        id_un = meta["un"]
        codigo = meta["codigo"]
        nome_hist = meta["nome"]
        for li, lote_info in enumerate(meta["lotes"]):
            lote = lote_info["lote"]
            ent = lote_info["ent"]
            ret = lote_info["ret"]
            saldo = ent - ret
            assert saldo > 0, f"saldo zero no item {iid} lote {lote}"
            data_ent = entr_dates[li % len(entr_dates)]
            validade = lote_info["validade"]
            tipo_ent = lote_info["tipo_ent"]
            doc = lote_info["doc"]

            nfe = sql_str(doc) if tipo_ent == 1 and doc else "NULL"
            forn_nome = "NULL"
            forn_doc = "NULL"
            doa_nome = "NULL"
            doa_doc = "NULL"
            if tipo_ent == 1:
                f = FORNECEDORES[fi % len(FORNECEDORES)]
                fi += 1
                forn_nome = sql_str(f[0])
                forn_doc = sql_str(f[1]) if f[1] else "NULL"
            else:
                d = DOADORES[di % len(DOADORES)]
                di += 1
                doa_nome = sql_str(d[0])
                doa_doc = sql_str(d[1]) if d[1] else "NULL"

            a(
                "INSERT INTO ItensEstoque (Id, IdUnidadeEstoque, Lote, Codigo, DataEntrega, DataHoraAtualizacao, DataHoraCriacao, "
                "DataValidade, EditadorPor, IsDeleted, NFe, Quantidade, Versao) VALUES "
                f"({iid}, {id_un}, {sql_str(lote)}, {sql_str(codigo)}, '{data_ent}', '{now}', '{data_ent}', "
                f"{sql_dt(validade)}, {sql_str(editor)}, 0, {nfe}, {saldo}, 1);"
            )

            # Entrada
            mov_id += 1
            id_usuario_ent = 1
            obs_ent = sql_str("Entrada inicial de estoque") if tipo_ent == 1 else sql_str("Entrada por doação")
            a(
                "INSERT INTO MovimentacoesEstoque (Id, IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao, "
                "TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario, DataHoraMovimentacao, "
                "Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento) VALUES "
                f"({mov_id}, {id_un}, {iid}, {sql_str(lote)}, {ent}, {ent}, {tipo_ent}, NULL, NULL, NULL, "
                f"{id_usuario_ent}, '{data_ent}', {obs_ent}, {nfe}, {forn_nome}, {forn_doc}, {doa_nome}, {doa_doc});"
            )

            # Retirada (se houver)
            if ret > 0:
                ret_id += 1
                data_ret = ret_dates[li % len(ret_dates)]
                id_retirante = 1
                id_recebedor = 2 if id_un == SEC else 5
                de = USERS[id_retirante]
                para = USERS[id_recebedor]
                obs_ret = sql_str("Uso interno / atendimento")
                a(
                    "INSERT INTO RetiradaEstoque (Id, Codigo, DataHoraRetirada, De, IdUsuarioRecebedor, IdUsuarioRetirante, "
                    "Lote, NomeOuDescricaoSimples, Observacao, Para, Quantidade, Status, DataValidadeLote, EstavaVencido, "
                    "IdMovimentacao, IdUnidadeEstoque) VALUES "
                    f"({ret_id}, {sql_str(codigo)}, '{data_ret}', {sql_str(de)}, {id_recebedor}, {id_retirante}, "
                    f"{sql_str(lote)}, {sql_str(nome_hist)}, {obs_ret}, {sql_str(para)}, {ret}, 'CONFIRMADA', "
                    f"{sql_dt(validade)}, 0, NULL, {id_un});"
                )

                mov_id += 1
                saldo_apos = ent - ret
                a(
                    "INSERT INTO MovimentacoesEstoque (Id, IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao, "
                    "TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario, DataHoraMovimentacao, "
                    "Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento) VALUES "
                    f"({mov_id}, {id_un}, {iid}, {sql_str(lote)}, {-ret}, {saldo_apos}, 5, NULL, NULL, {ret_id}, "
                    f"{id_retirante}, '{data_ret}', {obs_ret}, NULL, NULL, NULL, NULL, NULL);"
                )
                a(f"UPDATE RetiradaEstoque SET IdMovimentacao = {mov_id} WHERE Id = {ret_id};")

    a("")
    a("-- ---------------------------------------------------------------------------")
    a("-- 6) Transferências entre unidades (2 recebidas + 2 enviadas pendentes)")
    a("-- Status: Rascunho=1, Enviada=2, Recebida=3, Cancelada=4")
    a("-- TipoMovimentacao: TransferenciaSaida=3, TransferenciaEntrada=4")
    a("-- ---------------------------------------------------------------------------")

    # (id, origem, destino, status, data, id_envio, id_receb, obs, itens[(id_item, lote, codigo, qtd, saldo_origem_antes)])
    transferencias = [
        # Recebida SEC -> CAN: ração adulto
        (1, SEC, CAN, 3, "2026-06-15 10:00:00", 1, 5, "Reposição de ração no canil", [
            (1, "PROALRAC000001", "PRDALI0001", 10, 65),
        ]),
        # Recebida CAN -> SEC: ração filhote
        (2, CAN, SEC, 3, "2026-06-18 14:30:00", 1, 2, "Devolução de excedente ao estoque da secretaria", [
            (7, "PROALRAC000016", "PRDALI0007", 15, 80),
        ]),
        # Enviada SEC -> CAN: medicamento (aguardando recebimento)
        (3, SEC, CAN, 2, "2026-07-01 09:00:00", 1, None, "Envio de antibiótico para uso no canil", [
            (13, "MEDABAC000001", "MED0013", 5, 80),
        ]),
        # Enviada CAN -> SEC: vermífugo (aguardando recebimento)
        (4, CAN, SEC, 2, "2026-07-02 11:20:00", 1, None, "Transferência de vermífugo para a secretaria", [
            (18, "MEDAVER000011", "MED0018", 8, 90),
        ]),
    ]

    item_transf_id = 0
    for tid, origem, destino, status, data_tr, id_envio, id_receb, obs, itens_tr in transferencias:
        id_receb_sql = "NULL" if id_receb is None else str(id_receb)
        a(
            "INSERT INTO TransferenciasEstoque (Id, IdUnidadeOrigem, IdUnidadeDestino, DataTransferencia, "
            "IdUsuarioEnvio, IdUsuarioRecebimento, IdUsuarioAprovacao, Status, Observacao, "
            "DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted) VALUES "
            f"({tid}, {origem}, {destino}, '{data_tr}', {id_envio}, {id_receb_sql}, NULL, {status}, "
            f"{sql_str(obs)}, '{data_tr}', '{data_tr}', {sql_str(editor)}, 0);"
        )

        for id_item, lote, codigo, qtd, saldo_antes in itens_tr:
            saldo_origem_apos = saldo_antes - qtd
            a(
                f"UPDATE ItensEstoque SET Quantidade = {saldo_origem_apos}, Versao = Versao + 1, "
                f"DataHoraAtualizacao = '{data_tr}', EditadorPor = {sql_str(editor)} "
                f"WHERE Id = {id_item} AND IdUnidadeEstoque = {origem} AND Lote = {sql_str(lote)};"
            )

            mov_id += 1
            mov_saida_id = mov_id
            a(
                "INSERT INTO MovimentacoesEstoque (Id, IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao, "
                "TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario, DataHoraMovimentacao, "
                "Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento) VALUES "
                f"({mov_saida_id}, {origem}, {id_item}, {sql_str(lote)}, {-qtd}, {saldo_origem_apos}, 3, NULL, {tid}, NULL, "
                f"{id_envio}, '{data_tr}', {sql_str(obs)}, NULL, NULL, NULL, NULL, NULL);"
            )

            mov_entrada_id = "NULL"
            if status == 3:  # Recebida
                a(
                    "INSERT INTO ItensEstoque (Id, IdUnidadeEstoque, Lote, Codigo, DataEntrega, DataHoraAtualizacao, "
                    "DataHoraCriacao, DataValidade, EditadorPor, IsDeleted, NFe, Quantidade, Versao) VALUES "
                    f"({id_item}, {destino}, {sql_str(lote)}, {sql_str(codigo)}, '{data_tr}', '{data_tr}', '{data_tr}', "
                    f"NULL, {sql_str(editor)}, 0, NULL, {qtd}, 1);"
                )
                mov_id += 1
                mov_entrada_id = str(mov_id)
                a(
                    "INSERT INTO MovimentacoesEstoque (Id, IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao, "
                    "TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario, DataHoraMovimentacao, "
                    "Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento) VALUES "
                    f"({mov_entrada_id}, {destino}, {id_item}, {sql_str(lote)}, {qtd}, {qtd}, 4, NULL, {tid}, NULL, "
                    f"{id_receb}, '{data_tr}', {sql_str(obs)}, NULL, NULL, NULL, NULL, NULL);"
                )

            item_transf_id += 1
            a(
                "INSERT INTO TransferenciasEstoqueItens (Id, IdTransferencia, IdItem, Lote, Quantidade, "
                "ValorUnitario, IdMovimentacaoSaida, IdMovimentacaoEntrada) VALUES "
                f"({item_transf_id}, {tid}, {id_item}, {sql_str(lote)}, {qtd}, NULL, {mov_saida_id}, {mov_entrada_id});"
            )

    a("")
    a("-- ---------------------------------------------------------------------------")
    a("-- 7) Contadores de lote (próximo sequencial do gerador)")
    a("-- ---------------------------------------------------------------------------")
    a(f"INSERT INTO ContadoresLote (Tipo, UltimoNumero, Versao) VALUES ('PRO', {seq['PRO']}, 1);")
    a(f"INSERT INTO ContadoresLote (Tipo, UltimoNumero, Versao) VALUES ('INS', {seq['INS']}, 1);")
    a(f"INSERT INTO ContadoresLote (Tipo, UltimoNumero, Versao) VALUES ('MED', {seq['MED']}, 1);")
    a("")
    a("COMMIT;")
    a("PRAGMA foreign_keys = ON;")
    a("")
    a("-- Conferência rápida:")
    a("-- SELECT 'produtos' t, COUNT(*) c FROM Produtos")
    a("-- UNION ALL SELECT 'medicamentos', COUNT(*) FROM Medicamentos")
    a("-- UNION ALL SELECT 'insumos', COUNT(*) FROM Insumos")
    a("-- UNION ALL SELECT 'lotes', COUNT(*) FROM ItensEstoque")
    a("-- UNION ALL SELECT 'entradas', COUNT(*) FROM MovimentacoesEstoque WHERE TipoMovimentacao IN (1,2)")
    a("-- UNION ALL SELECT 'saidas', COUNT(*) FROM MovimentacoesEstoque WHERE TipoMovimentacao = 5")
    a("-- UNION ALL SELECT 'retiradas', COUNT(*) FROM RetiradaEstoque")
    a("-- UNION ALL SELECT 'transferencias', COUNT(*) FROM TransferenciasEstoque;")
    a("-- SELECT IdUnidadeEstoque, COUNT(*) FROM ItensEstoque GROUP BY IdUnidadeEstoque;")


    return "\n".join(lines) + "\n"


def apply(db_path: Path) -> None:
    import sqlite3

    # Regenera SQL sem os ALTER frágeis; aplica schema de forma idempotente.
    global seq
    seq = {"PRO": 0, "INS": 0, "MED": 0}
    sql = build()
    OUT.write_text(sql, encoding="utf-8")

    con = sqlite3.connect(str(db_path))
    cur = con.cursor()

    def cols(table: str) -> set[str]:
        return {r[1] for r in cur.execute(f"PRAGMA table_info({table})")}

    # Schema
    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS UnidadesMedida (
            Id INTEGER NOT NULL CONSTRAINT PK_UnidadesMedida PRIMARY KEY AUTOINCREMENT,
            Nome TEXT NOT NULL,
            Sigla TEXT NULL,
            AplicavelProduto INTEGER NOT NULL,
            AplicavelMedicamento INTEGER NOT NULL,
            AplicavelInsumo INTEGER NOT NULL,
            Ativa INTEGER NOT NULL,
            DataHoraCriacao TEXT NOT NULL,
            DataHoraAtualizacao TEXT NOT NULL,
            EditadorPor TEXT NOT NULL,
            IsDeleted INTEGER NOT NULL
        );
        """
    )
    if "Unidade" not in cols("Medicamentos"):
        cur.execute("ALTER TABLE Medicamentos ADD COLUMN Unidade INTEGER NOT NULL DEFAULT 7")
    if "RetiradaId" in cols("MovimentacoesEstoque"):
        cur.execute("ALTER TABLE MovimentacoesEstoque DROP COLUMN RetiradaId")
    cur.execute(
        "INSERT OR IGNORE INTO __EFMigrationsHistory (MigrationId, ProductVersion) "
        "VALUES ('20260704143922_UnidadesMedidaCatalogo', '8.0.11')"
    )
    con.commit()

    skip_prefixes = (
        "ALTER TABLE Medicamentos ADD COLUMN",
        "ALTER TABLE MovimentacoesEstoque DROP COLUMN",
        "CREATE TABLE IF NOT EXISTS UnidadesMedida",
        "CREATE TABLE IF NOT EXISTS _seed_flags",
        "DELETE FROM _seed_flags",
        "INSERT INTO _seed_flags",
        "INSERT OR IGNORE INTO __EFMigrationsHistory",
        "PRAGMA foreign_keys",
        "BEGIN TRANSACTION",
        "COMMIT",
    )

    cur.execute("PRAGMA foreign_keys = OFF")
    cur.execute("BEGIN")
    buf: list[str] = []
    skipping_stmt = False
    for line in sql.splitlines():
        s = line.strip()
        if not buf and not skipping_stmt and (not s or s.startswith("--")):
            continue
        if not buf and not skipping_stmt:
            skipping_stmt = any(s.startswith(p) for p in skip_prefixes)
        if not skipping_stmt:
            buf.append(line)
        if s.endswith(";"):
            if not skipping_stmt and buf:
                cur.execute("\n".join(buf))
            buf = []
            skipping_stmt = False
    cur.execute("COMMIT")
    cur.execute("PRAGMA foreign_keys = ON")
    con.commit()

    print("Aplicado em", db_path)
    for q in [
        "SELECT 'produtos', COUNT(*) FROM Produtos",
        "SELECT 'medicamentos', COUNT(*) FROM Medicamentos",
        "SELECT 'insumos', COUNT(*) FROM Insumos",
        "SELECT 'lotes', COUNT(*) FROM ItensEstoque",
        "SELECT 'entradas', COUNT(*) FROM MovimentacoesEstoque WHERE TipoMovimentacao IN (1,2)",
        "SELECT 'saidas', COUNT(*) FROM MovimentacoesEstoque WHERE TipoMovimentacao = 5",
        "SELECT 'retiradas', COUNT(*) FROM RetiradaEstoque",
        "SELECT 'sec_lotes', COUNT(*) FROM ItensEstoque WHERE IdUnidadeEstoque=1",
        "SELECT 'can_lotes', COUNT(*) FROM ItensEstoque WHERE IdUnidadeEstoque=2",
    ]:
        print(cur.execute(q).fetchone())
    con.close()


if __name__ == "__main__":
    import sys

    sql = build()
    OUT.write_text(sql, encoding="utf-8")
    print(f"Gerado: {OUT} ({len(sql.splitlines())} linhas)")
    print(f"Contadores: PRO={seq['PRO']} INS={seq['INS']} MED={seq['MED']}")

    if "--apply" in sys.argv:
        db = Path(__file__).with_name("canilappDO.db")
        apply(db)
