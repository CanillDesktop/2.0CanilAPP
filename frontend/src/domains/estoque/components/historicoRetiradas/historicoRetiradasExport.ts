import type { RetiradaHistoricoItemDto } from '../../types/tiposEstoque';

/** CSV client-side apenas da página atual — opção secundária para integração rápida. */
export function exportarRetiradasPaginaComoCsv(
  itens: RetiradaHistoricoItemDto[],
  nomeBase = `retiradas-pagina-${new Date().toISOString().slice(0, 10)}`,
): void {
  const cabecalhos = [
    'id',
    'data_hora_iso_utc',
    'codigo',
    'nome_produto',
    'lote',
    'quantidade',
    'retirante_exibicao',
    'id_usuario_retirante',
    'recebedor_exibicao',
    'id_usuario_recebedor',
    'observacao',
    'status',
  ];

  const linhas = itens.map((r) =>
    [
      r.id,
      r.dataHoraRetirada,
      r.codigo,
      r.nomeProduto,
      r.lote,
      r.quantidade,
      r.usuarioRetiranteExibicao,
      r.idUsuarioRetirante ?? '',
      r.usuarioRecebedorExibicao,
      r.idUsuarioRecebedor ?? '',
      (r.observacao ?? '').replace(/\r?\n/g, ' '),
      r.status,
    ]
      .map(celCsv)
      .join(';'),
  );

  const bom = '\uFEFF';
  const csv = bom + cabecalhos.join(';') + '\n' + linhas.join('\n');
  dispararDownloadTexto(csv, `${nomeBase}.csv`, 'text/csv;charset=utf-8');
}

export function dispararDownloadBlob(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Extrai nome de arquivo do header Content-Disposition, se presente. */
export function extrairNomeArquivoContentDisposition(header: string | undefined): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const simples = /filename="?([^";]+)"?/i.exec(header);
  return simples?.[1]?.trim() ?? null;
}

function celCsv(v: string | number): string {
  const s = String(v);
  if (/[;"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function dispararDownloadTexto(corpo: string, nomeArquivo: string, mime: string): void {
  dispararDownloadBlob(new Blob([corpo], { type: mime }), nomeArquivo);
}
