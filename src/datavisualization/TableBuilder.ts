import PeriodAggregations from '../analytics/PeriodAggregations';
import TableColumn from './TableColumn';

class TableBuilder {
  private _periods: PeriodAggregations[];

  constructor(periods: PeriodAggregations[]) {
    this._periods = periods;
  }

  public build(headerPrefix?: string): string {
    if (this._periods.length === 0) {
      throw new Error('No periods available!');
    }

    return `
    <table class="rounded m-3 bg-white">\n
    ${this.header(headerPrefix)}\n
    ${this.body()}\n
    </table>`;
  }

  //Private implementations

  private header(prefixCell?: string): string {
    let depth = 0;
    let cols = this._periods.map((p) => p.toTableColumn());
    let r: string = '';

    r += cols.map((c) => c.head()).join('') + '</tr>';
    depth += 1;
    while (cols.every((c) => c.hasTail())) {
      cols = cols.map((c) => c.tail()).flat();
      r += '<tr>' + cols.map((c) => c.head()).join('') + '</tr>';
      depth += 1;
    }

    if (prefixCell) {
      return `<tr><td rowspan="${depth}">${prefixCell}</td>${r}`;
    }

    return `<tr>${r}`;
  }

  private body(): string {
    const metrics: string[] = [...new Set<string>(this._periods.map((p) => [...p.getAggregatedMetricNames()]).flat())];
    console.log('[TableBuilder] found metrics ', metrics);
    return metrics.reduce((t: string, c: string) => {
      //start the row for this metric
      t += '<tr>\n';
      //add the name of this matric at the beginning of the row
      t += `<td>${c}</td>`;
      //add each of the values of this metric for each diaggregated period
      t += `${this._periods
        .map((p) => p.getAggregatedMetric(c))
        .flat()
        .map((n) => `<td>${n}</td>`)
        .join('')}`;
      //end the row
      t += '\n</tr>';
      return t;
    }, '');
  }
}

export default TableBuilder;
