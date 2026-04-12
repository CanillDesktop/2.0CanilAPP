type Props = {
  visivel: boolean;
  rotulo?: string;
};

export function IndicadorCarregamento({ visivel, rotulo = 'Carregando…' }: Props) {
  if (!visivel) return null;
  return (
    <p className="indicador-carregamento" role="status" aria-live="polite">
      {rotulo}
    </p>
  );
}
