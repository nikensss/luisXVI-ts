import Period from './enums/Period';
import Aggregation from './Aggregation';
import Table from './interfaces/Table';

class PeriodAggregations implements Table {
  private _period: Period;
  private _name: string;
  private _data: PeriodAggregations[] | Aggregation[];

  constructor(period: Period, name: string, data: PeriodAggregations[] | Aggregation[]) {
    this._period = period;
    this._name = name;
    this._data = data;
  }

  get period(): Period {
    return this._period;
  }

  get name(): string {
    return this._name;
  }

  get data(): PeriodAggregations[] | Aggregation[] {
    return this._data;
  }

  totalSpan(): number {
    if (this.data.every((d: any) => d instanceof Aggregation)) {
      return 1;
    }

    return (<PeriodAggregations[]>this.data).reduce((t, c) => t + c.totalSpan(), 0);
  }

  periodTree(): string | any[] {
    if (this.data.every((d: any) => d instanceof Aggregation)) {
      return `<td>${this.name}</td>`;
    }

    let periodNames: any[] = [
      `<td colspan="${this.totalSpan()}">${this.name}</td>`,
      (<PeriodAggregations[]>this.data).map((p) => p.periodTree())
    ];

    return periodNames;
  }

  toHtmlTableData(): string {
    let htmlTableData: string = '<tr>\n';
    let guts: string = (<Table[]>this.data).map((d: Table) => d.toHtmlTableData()).join('\n');

    htmlTableData += `<td><span class="p-2">${this.name}</span></td><td><table>${guts}</table></td>\n`;

    htmlTableData += '</tr>\n';
    return htmlTableData;
  }
}

export default PeriodAggregations;
