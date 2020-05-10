class Aggregation {
  private _name: string;
  private _value: number;

  constructor(name: string, value: number) {
    this._name = name;
    this._value = value;
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  toHtmlTableData(): string {
    return `<tr><td><span class="p-2">${this.name}</span></td><td>${this.value}</td></tr>`;
  }
}

export default Aggregation;
