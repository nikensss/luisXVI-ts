import Period from './enums/Period';
import Aggregation from './Aggregation';

class PeriodAggregation {
  private _period: Period;
  private _name: string;
  private _data: PeriodAggregation[] | Aggregation[];

  constructor(period: Period, name: string, data: PeriodAggregation[] | Aggregation[]) {
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

  get data(): PeriodAggregation[] | Aggregation[] {
    return this._data;
  }

  toHtmlTableData(): string {
    let htmlTableData: string = '<tr>\n';
    let guts: string = '';

    if (this.data.every((d: PeriodAggregation | Aggregation) => d instanceof PeriodAggregation)) {
      guts += (<PeriodAggregation[]>this.data).map((d: PeriodAggregation) => d.toHtmlTableData()).join('\n');
    } else {
      guts += (<Aggregation[]>this.data).map((d: Aggregation) => `<tr>${d.toHtmlTableData()}</tr>`).join('\n');
    }

    htmlTableData += `<td><span class="p-2">${this.name}</span></td><td><table>${guts}</table></td>\n`;

    htmlTableData += '</tr>\n';
    return htmlTableData;
  }
}

export default PeriodAggregation;
