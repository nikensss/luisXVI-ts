import PeriodAggregations from '../analytics/PeriodAggregations';
import TableColumn from './TableColumn';

class TableBuilder {
  private _cols: TableColumn[];

  constructor(columns: TableColumn[]) {
    this._cols = columns;
  }

  static fromPeriodsAggregations(periodsAggregations: PeriodAggregations[]): TableBuilder {
    const builder = new TableBuilder(periodsAggregations.map((p) => p.toTableColumn()));

    return builder;
  }

  public build(prefixCell?: string): string {
    if (this._cols.length === 0) {
      throw new Error('No heads found!');
    }

    return `<table class="rounded m-3 bg-white">${this.header(prefixCell)}</table>`;
  }

  //Private implementations

  private header(prefixCell?: string): string {
    let depth = 0;
    let cols = this._cols.slice();
    let r: string = '';

    r += cols.map((c) => c.head()).join('') + '</tr>';
    depth += 1;
    while (cols.every((c) => c.hasTail())) {
      cols = cols.map((c) => c.tail()).reduce((t, c) => t.concat(c), []);
      r += '<tr>' + cols.map((c) => c.head()).join('') + '</tr>';
      depth += 1;
    }

    if (prefixCell) {
      return `<tr><td rowspan="${depth}">${prefixCell}</td>${r}`;
    }

    return `<tr>${r}`;
  }
}

export default TableBuilder;
