import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import type { RetiradaEstoqueDto } from '../types/tiposEstoque';

export function FormularioRetirada() {
  const navegar = useNavigate();
  const { registrarRetirada, carregando, erro } = useMutacaoEstoque();
  const [idRetirada, setIdRetirada] = useState(0);
  const [codItem, setCodItem] = useState('');
  const [nomeItem, setNomeItem] = useState('');
  const [lote, setLote] = useState('');
  const [de, setDe] = useState('');
  const [para, setPara] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataHoraInsercaoRegistro, setDataHoraInsercaoRegistro] = useState(
    new Date().toISOString().slice(0, 16),
  );

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: RetiradaEstoqueDto = {
      idRetirada,
      codItem,
      nomeItem,
      lote,
      de,
      para,
      quantidade,
      dataHoraInsercaoRegistro: new Date(dataHoraInsercaoRegistro).toISOString(),
    };
    const ok = await registrarRetirada(dto);
    if (ok) navegar('/estoque');
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Registrar retirada de estoque</h1>
      <PainelErro mensagem={erro} />
      <label>
        ID retirada (use 0 se não aplicável)
        <input type="number" value={idRetirada} onChange={(e) => setIdRetirada(Number(e.target.value))} min={0} />
      </label>
      <label>
        Código do item
        <input value={codItem} onChange={(e) => setCodItem(e.target.value)} required />
      </label>
      <label>
        Nome do item
        <input value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} required />
      </label>
      <label>
        Lote
        <input value={lote} onChange={(e) => setLote(e.target.value)} required />
      </label>
      <label>
        De (origem)
        <input value={de} onChange={(e) => setDe(e.target.value)} required />
      </label>
      <label>
        Para (destino)
        <input value={para} onChange={(e) => setPara(e.target.value)} required />
      </label>
      <label>
        Quantidade
        <input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} min={1} />
      </label>
      <label>
        Data/hora do registro
        <input
          type="datetime-local"
          value={dataHoraInsercaoRegistro}
          onChange={(e) => setDataHoraInsercaoRegistro(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={carregando}>
        Registrar
      </button>
      <IndicadorCarregamento visivel={carregando} />
    </form>
  );
}
