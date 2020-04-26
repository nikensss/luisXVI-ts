import fs, { PathLike } from 'fs';
import path from 'path';

class DownloadManager {
  private _downloadPath: PathLike;

  constructor(downloadPath: PathLike) {
    this._downloadPath = downloadPath;
    if (!fs.existsSync(this._downloadPath)) {
      this.log(`directory '${this._downloadPath}' doesn't exist, creating...`);
      fs.mkdirSync(this._downloadPath);
      this.log('creation successful!');
    }
  }

  flush() {
    fs.readdirSync(this._downloadPath).forEach((f) => {
      this.log(`deleting ${f}`);
      fs.unlinkSync(path.join(this._downloadPath.toString(), f));
    });
  }

  private log(msg: string) {
    console.log(`[DownloadManager] ${msg}`);
  }
}

export default DownloadManager;
