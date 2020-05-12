import Period from './enums/Period';
import Aggregation from './Aggregation';
import TableColumn from '../datavisualization/TableColumn';

class PeriodAggregations {
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

  toTableColumn(): TableColumn {
    if (this.data.every((d: any) => d instanceof Aggregation)) {
      return new TableColumn(this.name, 1);
    }

    return new TableColumn(this.name, this.totalSpan(), <PeriodAggregations[]>this.data);
  }
}

export default PeriodAggregations;
