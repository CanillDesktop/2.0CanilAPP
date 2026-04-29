import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useAcaoLogin } from '../hooks/useAcaoLogin';

type Props = {
  aoAutenticar: () => void;
};

export function FormularioLogin({ aoAutenticar }: Props) {
  const { entrar, carregando, erro, errosValidacao } = useAcaoLogin();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    const ok = await entrar({ login, senha });
    if (ok) aoAutenticar();
  }

  return (
    <form className="cartao" onSubmit={aoEnviar}>
      <h1>Entrar</h1>
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
      <label>
        E-mail (login)
        <input
          type="email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label>
        Senha
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" disabled={carregando}>
        {carregando ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="formulario-rodape">
        <Link to="/cadastro">Criar conta</Link>
      </p>
      <IndicadorCarregamento visivel={carregando} />
    </form>
  );
}
