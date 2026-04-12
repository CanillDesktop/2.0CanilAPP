import type { FormEvent } from 'react';
import { useState } from 'react';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useCadastroUsuario } from '../hooks/useCadastroUsuario';
import type { UsuarioCadastroDto } from '../types/tiposUsuarios';

export function FormularioCadastroUsuario() {
  const { cadastrar, carregando, erro, criado } = useCadastroUsuario();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [permissao, setPermissao] = useState(2);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: UsuarioCadastroDto = { nome, sobrenome, email, senha, permissao };
    await cadastrar(dto);
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Cadastro de usuário</h1>
      <PainelErro mensagem={erro} />
      {criado && (
        <p className="painel-sucesso" role="status">
          Usuário criado: {criado.email}
        </p>
      )}
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </label>
      <label>
        Sobrenome
        <input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
      </label>
      <label>
        E-mail
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Senha
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} required />
      </label>
      <label>
        Permissão
        <select value={permissao} onChange={(e) => setPermissao(Number(e.target.value))}>
          <option value={1}>Administrador</option>
          <option value={2}>Leitura</option>
        </select>
      </label>
      <button type="submit" disabled={carregando}>
        Salvar
      </button>
      <IndicadorCarregamento visivel={carregando} rotulo="Salvando…" />
    </form>
  );
}
