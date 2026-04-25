import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: UsuarioCadastroDto = { primeiroNome: nome, sobrenome, email, senha };
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
      <p className="formulario-rodape" style={{ marginTop: '0.5rem' }}>
        Sua conta será criada com permissão <strong>Leitura</strong>. Para virar administrador, outro admin precisa
        alterar sua permissão em Usuários.
      </p>
      <button type="submit" disabled={carregando}>
        Salvar
      </button>
      <p className="formulario-rodape">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
      <IndicadorCarregamento visivel={carregando} rotulo="Salvando…" />
    </form>
  );
}
