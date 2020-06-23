import PeriodAggregations from '../analytics/PeriodAggregations';
import TableColumn from './TableColumn';

class TableBuilder {
  private _periods: PeriodAggregations[];

  constructor(periods: PeriodAggregations[]) {
    this._periods = periods;
  }

  public build(headerPrefix: string = ''): string {
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

  private header(prefixCell: string = ''): string {
    let depth = 0;
    let cols = this._periods.map(p => p.toTableColumn());
    let r: string = '';

    r += cols.map(c => c.head()).join('') + '</tr>';
    depth += 1;
    while (cols.every(c => c.hasTail())) {
      cols = cols.map(c => c.tail()).flat();
      r += '<tr>' + cols.map(c => c.head()).join('') + '</tr>';
      depth += 1;
    }

    return `<thead><tr><td rowspan="${depth}" class='first-column'>${prefixCell}</td>${r}</thead>`;
  }

  private body(): string {
    const metrics: string[] = [
      ...new Set<string>(
        this._periods.map(p => [...p.getAggregatedMetricNames()]).flat()
      )
    ];

    console.log('[TableBuilder] metrics found', metrics);

    //TODO: it would be nice if somehow we could ensure that the retrieved metric
    //corresponds to the time period that column represents. At this moment they
    //match because of the sorting order and the sweept order of the array, but
    //I don't feel comfortable with that...

    return metrics.reduce((t: string, c: string) => {
      //start the row for this metric
      t += '<tr>\n';
      //add the name of this metric at the beginning of the row
      t += `<td class='first-column metric-name'>${c}</td>`;
      //add each of the values of this metric for each disaggregated period
      t += `${this._periods
        .map(p => p.getAggregatedMetric(c))
        .flat()
        .map(n => `<td>${n}</td>`)
        .join('')}`;
      //end the row
      t += '\n</tr>';
      return t;
    }, '');
  }
}

export default TableBuilder;
