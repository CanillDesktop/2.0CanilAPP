import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoInsumo } from '../hooks/useInsumos';
import type { InsumoCadastroDto } from '../types/tiposInsumos';

export function FormularioInsumo() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoInsumo();
  const [descricaoSimplificada, setDescricaoSimplificada] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [unidade, setUnidade] = useState(1);
  const [dataValidade, setDataValidade] = useState('');
  const [nivelMinimoEstoque, setNivelMinimoEstoque] = useState(0);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: InsumoCadastroDto = {
      descricaoSimplificada,
      descricaoDetalhada,
      lote,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      unidade,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };
    const ok = await criar(dto);
    if (ok) navegar('/insumos');
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Novo insumo</h1>
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
      <label>
        Descrição simplificada
        <input value={descricaoSimplificada} onChange={(e) => setDescricaoSimplificada(e.target.value)} required />
      </label>
      <label>
        Descrição detalhada
        <input value={descricaoDetalhada} onChange={(e) => setDescricaoDetalhada(e.target.value)} required />
      </label>
      <label>
        Unidade (enum numérico)
        <input type="number" value={unidade} onChange={(e) => setUnidade(Number(e.target.value))} min={1} />
      </label>
      <label>
        Lote inicial
        <input value={lote} onChange={(e) => setLote(e.target.value)} />
      </label>
      <label>
        Quantidade inicial
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
      <label>
        Nível mínimo de estoque
        <input
          type="number"
          value={nivelMinimoEstoque}
          onChange={(e) => setNivelMinimoEstoque(Number(e.target.value))}
          min={0}
        />
      </label>
      <button type="submit" disabled={carregando}>
        Criar
      </button>
      <IndicadorCarregamento visivel={carregando} />
    </form>
  );
}
