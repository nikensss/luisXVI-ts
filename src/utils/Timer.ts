class Timer {
  private _timeout: number;
  private _startTime: Date;

  constructor(timeout: number) {
    this._timeout = timeout;
    this._startTime = new Date();
  }

  start(): void {
    this._startTime = new Date();
  }

  reset(): void {
    this.start();
  }

  isTimeout(): boolean {
    return new Date().getTime() - this._startTime.getTime() > this._timeout;
  }
}

export default Timer;
