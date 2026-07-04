import type { ReactNode } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { KpiSectionListagem } from '../../../shared/components/KpiSectionListagem';
import type { StatusEstoqueFiltro } from '../../../shared/types/itemComEstoqueLista';
import { MARCA } from '../../../shared/theme/tokensTema';

type Kpi = {
  titulo: string;
  valor: number;
  icon: ReactNode;
  statusFiltro: StatusEstoqueFiltro;
};

const CORES_ICONE = (cores: ReturnType<typeof useTemaApp>['cores']) =>
  [cores.accent, cores.brandHighlight, MARCA.salmao, cores.acaoMovimentar, cores.acaoExcluir] as const;

export function KpiSectionMedicamentos({
  kpis,
  carregando,
  statusSelecionado,
  onStatusChange,
}: {
  kpis: Kpi[];
  carregando: boolean;
  statusSelecionado: StatusEstoqueFiltro;
  onStatusChange: (status: StatusEstoqueFiltro) => void;
}) {
  const { cores } = useTemaApp();
  const coresIcone = CORES_ICONE(cores);

  return (
    <KpiSectionListagem
      carregando={carregando}
      statusSelecionado={statusSelecionado}
      onStatusChange={onStatusChange}
      kpis={kpis.map((kpi, indice) => ({
        ...kpi,
        corIcone: coresIcone[indice % coresIcone.length],
      }))}
    />
  );
}
