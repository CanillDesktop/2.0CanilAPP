/** Fuso operacional do canil (sem horário de verão desde 2019). */
export const FUSO_BRASILIA = 'America/Sao_Paulo';

const rotuloFusoBrasilia = 'Horário de Brasília';

/** YYYY-MM-DD do instante no calendário de Brasília. */
export function ymdNoFusoBrasilia(instante: Date | string = new Date()): string {
  const d = typeof instante === 'string' ? new Date(instante) : instante;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function horaNoFuso(instante: Date, timeZone: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).format(instante),
  );
}

/** UTC do início do dia civil em Brasília (00:00:00.000). */
export function inicioDiaBrasiliaParaUtc(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  let utcMs = Date.UTC(y, m - 1, d, 3, 0, 0, 0);
  for (let i = 0; i < 48; i++) {
    const atual = new Date(utcMs);
    const dia = ymdNoFusoBrasilia(atual);
    const hora = horaNoFuso(atual, FUSO_BRASILIA);
    if (dia === ymd && hora === 0) return atual;
    if (dia > ymd || (dia === ymd && hora > 0)) utcMs -= 3_600_000;
    else utcMs += 3_600_000;
  }
  return new Date(utcMs);
}

export function ymdAdicionarDiasBrasilia(ymd: string, dias: number): string {
  return ymdNoFusoBrasilia(new Date(inicioDiaBrasiliaParaUtc(ymd).getTime() + dias * 86_400_000));
}

/** UTC do fim do dia civil em Brasília (23:59:59.999). */
export function fimDiaBrasiliaParaUtcInclusive(ymd: string): Date {
  const proximo = ymdAdicionarDiasBrasilia(ymd, 1);
  return new Date(inicioDiaBrasiliaParaUtc(proximo).getTime() - 1);
}

export function formatarDataBrasilia(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_BRASILIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatarFaixaPeriodoBrasilia(inicioIso: string, fimIso: string): string {
  return `${formatarDataBrasilia(inicioIso)} até ${formatarDataBrasilia(fimIso)}`;
}

export function intervaloPadraoUltimosDiasBrasilia(dias: number): { ini: string; fim: string } {
  const fim = ymdNoFusoBrasilia();
  const ini = ymdAdicionarDiasBrasilia(fim, -(dias - 1));
  return { ini, fim };
}

export { rotuloFusoBrasilia };
