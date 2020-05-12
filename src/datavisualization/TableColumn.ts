import PeriodAggregations from '../analytics/PeriodAggregations';
import Aggregation from '../analytics/Aggregation';

class TableColumn {
  private _name: string;
  private _span: number;
  private _data: TableColumn[];

  constructor(name: string, span: number, data: PeriodAggregations[] = []) {
    this._name = name;
    this._span = span;
    this._data = data.map((p: PeriodAggregations) => p.toTableColumn()) as TableColumn[];
  }

  head(): string {
    return `<td colspan="${this._span}">${this._name}</td>`;
  }

  tail(): TableColumn[] {
    return this._data;
  }

  hasTail(): boolean {
    return this._data.length > 0;
  }
}

export default TableColumn;
