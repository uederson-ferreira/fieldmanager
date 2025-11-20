// ===================================================================
// DECLARAÇÃO DE TIPOS - jspdf-autotable
// Extensão do jsPDF para suportar autotable
// ===================================================================

import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  interface ColumnInput {
    header?: string;
    dataKey?: string;
  }

  interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | [number, number, number] | false;
    textColor?: number | [number, number, number];
    cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    fontSize?: number;
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    lineColor?: number | [number, number, number];
    lineWidth?: number;
  }

  interface CellHookData {
    cell: {
      raw: string | number | CellDef;
      text: string[];
      styles: Styles;
      section: 'head' | 'body' | 'foot';
      contentHeight: number;
      contentWidth: number;
      width: number;
      height: number;
      x: number;
      y: number;
      textPos: { x: number; y: number };
    };
    row: {
      raw: any;
      index: number;
      section: 'head' | 'body' | 'foot';
    };
    column: {
      dataKey: string | number;
      index: number;
    };
    section: 'head' | 'body' | 'foot';
  }

  interface UserOptions {
    // Configurações básicas
    head?: CellDef[][] | string[][];
    body?: CellDef[][] | any[][];
    foot?: CellDef[][] | string[][];

    // Colunas
    columns?: ColumnInput[];
    columnStyles?: { [key: string | number]: Partial<Styles> };

    // Posicionamento
    startY?: number | false;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;

    // Temas
    theme?: 'plain' | 'striped' | 'grid';
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;

    // Callbacks
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: { pageNumber: number; pageCount: number; settings: any }) => void;

    // Outras
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    useCss?: boolean;
    tableLineColor?: number | [number, number, number];
    tableLineWidth?: number;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;

  export default autoTable;
  export { UserOptions, Styles, CellDef, CellHookData };
}
