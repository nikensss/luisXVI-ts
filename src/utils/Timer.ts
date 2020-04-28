class Timer {
  private _timeout: number;
  private _startTime?: Date;

  constructor(timeout: number) {
    this._timeout = timeout;
  }

  start(): void {
    this._startTime = new Date();
  }

  isTimeout(): boolean {
    if (!this._startTime) {
      throw new Error('Timer has not been started!');
    }
    return new Date().getTime() - this._startTime.getTime() > this._timeout;
  }
}

export default Timer;
