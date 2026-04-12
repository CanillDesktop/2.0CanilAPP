import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import type { ItemEstoqueDto } from '../types/tiposEstoque';

export function FormularioNovoLote() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { criarLote, carregando, erro } = useMutacaoEstoque();

  const inicialIdItem = useMemo(() => Number(params.get('idItem')) || 0, [params]);
  const inicialCodItem = useMemo(() => params.get('codItem') ?? '', [params]);

  const [idItem, setIdItem] = useState(inicialIdItem);
  const [codItem, setCodItem] = useState(inicialCodItem);

  useEffect(() => {
    setIdItem(inicialIdItem);
    setCodItem(inicialCodItem);
  }, [inicialIdItem, inicialCodItem]);
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [dataValidade, setDataValidade] = useState('');

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: ItemEstoqueDto = {
      idItem,
      codItem,
      lote,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
    };
    const ok = await criarLote(dto);
    if (ok) navegar('/estoque');
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Novo lote no estoque</h1>
      <PainelErro mensagem={erro} />
      <label>
        ID do item (produto/medicamento/insumo)
        <input type="number" value={idItem} onChange={(e) => setIdItem(Number(e.target.value))} required min={1} />
      </label>
      <label>
        Código do item
        <input value={codItem} onChange={(e) => setCodItem(e.target.value)} required />
      </label>
      <label>
        Lote
        <input value={lote} onChange={(e) => setLote(e.target.value)} required />
      </label>
      <label>
        Quantidade
        <input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} min={0} />
      </label>
      <label>
        Data de entrega
        <input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} required />
      </label>
      <label>
        NF-e / documento
        <input value={nfe} onChange={(e) => setNfe(e.target.value)} />
      </label>
      <label>
        Data de validade
        <input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />
      </label>
      <button type="submit" disabled={carregando}>
        Salvar lote
      </button>
      <IndicadorCarregamento visivel={carregando} />
    </form>
  );
}
