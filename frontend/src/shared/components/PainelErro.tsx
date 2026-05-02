type ErroProps = {
  mensagem: string | null;
  errosValidacao?: string[] | null;
};

export function PainelErro({ mensagem, errosValidacao }: ErroProps) {
  if (!mensagem) return null;
  return (
    errosValidacao ?
      <div className="painel-erro" role="alert">
        <ul style={{ listStyle: "none" }}>
          {errosValidacao.map((erro, index) => (
            <li key={index}>{erro}</li>
          ))}
        </ul>
      </div>
      : <div className="painel-erro" role="alert">
        {mensagem}
      </div>
  );
}
