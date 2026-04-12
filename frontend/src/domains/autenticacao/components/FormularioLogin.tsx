import type { FormEvent } from 'react';
import { useState } from 'react';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useAcaoLogin } from '../hooks/useAcaoLogin';

type Props = {
  aoAutenticar: () => void;
};

export function FormularioLogin({ aoAutenticar }: Props) {
  const { entrar, carregando, erro } = useAcaoLogin();
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
      <PainelErro mensagem={erro} />
      <label>
        Login
        <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required />
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
      <IndicadorCarregamento visivel={carregando} />
    </form>
  );
}
