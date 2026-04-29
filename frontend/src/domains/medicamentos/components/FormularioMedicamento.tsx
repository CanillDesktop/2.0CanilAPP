import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoMedicamento } from '../hooks/useMedicamentos';
import type { MedicamentoCadastroDto } from '../types/tiposMedicamentos';

export function FormularioMedicamento() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoMedicamento();
  const [prioridade, setPrioridade] = useState(0);
  const [descricaoMedicamento, setDescricaoMedicamento] = useState('');
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [formula, setFormula] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState(0);
  const [dataValidade, setDataValidade] = useState('');
  const [nivelMinimoEstoque, setNivelMinimoEstoque] = useState(0);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: MedicamentoCadastroDto = {
      prioridade,
      descricao: descricaoMedicamento,
      lote,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      formula,
      nomeComercial,
      publicoAlvo,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };
    const ok = await criar(dto);
    if (ok) navegar('/medicamentos');
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Novo medicamento</h1>
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
      <label>
        Nome comercial
        <input value={nomeComercial} onChange={(e) => setNomeComercial(e.target.value)} required />
      </label>
      <label>
        Fórmula
        <input value={formula} onChange={(e) => setFormula(e.target.value)} required />
      </label>
      <label>
        Descrição
        <input value={descricaoMedicamento} onChange={(e) => setDescricaoMedicamento(e.target.value)} required />
      </label>
      <label>
        Prioridade (0=Baixa, 1=Média, 2=Alta)
        <input type="number" value={prioridade} onChange={(e) => setPrioridade(Number(e.target.value))} min={0} max={2} />
      </label>
      <label>
        Público-alvo (0=Animal, 1=Humano e animal)
        <input type="number" value={publicoAlvo} onChange={(e) => setPublicoAlvo(Number(e.target.value))} min={0} max={1} />
      </label>
      <label>
        Lote inicial
        <input value={lote} onChange={(e) => setLote(e.target.value)} required />
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
