type Props = {
  mensagem: string | null;
};

export function PainelErro({ mensagem }: Props) {
  if (!mensagem) return null;
  return (
    <div className="painel-erro" role="alert">
      {mensagem}
    </div>
  );
}
