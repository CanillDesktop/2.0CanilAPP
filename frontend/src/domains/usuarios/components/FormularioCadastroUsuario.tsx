import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useCadastroUsuario } from '../hooks/useCadastroUsuario';
import type { UsuarioCadastroComConfirmacaoDto } from '../types/tiposUsuarios';

export function FormularioCadastroUsuario() {
  const { cadastrar, carregando, erro, errosValidacao, criado } = useCadastroUsuario();
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const dto: UsuarioCadastroComConfirmacaoDto = { primeiroNome, sobrenome, email, senha, senhaConfirmacao, permissao: 2 };
    await cadastrar(dto);
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Cadastro de usuário</h1>
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
      {criado && (
        <p className="painel-sucesso" role="status">
          Usuário criado: {criado.email}
        </p>
      )}
      <label>
        Nome
        <input value={primeiroNome} onChange={(e) => setPrimeiroNome(e.target.value)} required />
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
        Confirmar senha
        <input type="password" value={senhaConfirmacao} onChange={(e) => setSenhaConfirmacao(e.target.value)} minLength={6} required />
      </label>
      <p className="formulario-rodape" style={{ marginTop: '0.5rem' }}>
        Enquanto o sistema tiver menos de <strong>dois</strong> usuários cadastrados no total, novas contas recebem
        permissão de <strong>Administrador</strong> automaticamente. Depois disso, a permissão padrão é{' '}
        <strong>Leitura</strong>; um administrador pode alterar isso em Usuários.
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
