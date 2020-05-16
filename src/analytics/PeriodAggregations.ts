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

  get aggregations(): Aggregation[] {
    if (this.hasAggregations()) return this.data as Aggregation[];

    throw new Error('[PeriodAggregations] Data is not Aggregationp[]!');
  }

  get periodAggregations(): PeriodAggregations[] {
    if (this.hasPeriodAggregations()) return this.data as PeriodAggregations[];

    throw new Error('[PeriodAggregations] Data is not PeriodAggregations[]!');
  }

  hasAggregations(): boolean {
    return this.data.every((d: PeriodAggregations | Aggregation) => d instanceof Aggregation);
  }

  hasPeriodAggregations(): boolean {
    return this.data.every((d: PeriodAggregations | Aggregation) => d instanceof PeriodAggregations);
  }

  totalSpan(): number {
    if (this.hasAggregations()) return 1;

    return this.periodAggregations.reduce((t, c) => t + c.totalSpan(), 0);
  }

  toTableColumn(): TableColumn {
    if (this.hasAggregations()) {
      return new TableColumn(this.name, 1);
    } else if (this.hasPeriodAggregations()) {
      return new TableColumn(this.name, this.totalSpan(), this.periodAggregations);
    }

    throw new Error('[PeriodAggregations] Illegal State! Check type of elements in this.data!');
  }

  getAggregatedMetricNames(): Set<string> {
    if (this.data.length === 0) throw new Error('No metric has been aggregated!');

    if (this.hasAggregations()) {
      return new Set<string>(this.aggregations.map((a) => a.name));
    }

    return new Set<string>(this.periodAggregations.map((p) => [...p.getAggregatedMetricNames()]).flat());
  }

  getAggregatedMetric(metric: string): number[] {
    if (this.data.length === 0) throw new Error('No metric has been aggregated!');

    if (this.hasAggregations()) {
      return this.aggregations.filter((a) => a.name === metric).map((a) => a.value);
    }

    return this.periodAggregations.map((p) => p.getAggregatedMetric(metric)).flat();
  }
}

export default PeriodAggregations;
