import fs, { PathLike } from 'fs';
import path from 'path';

/**
 * Knows where files are downloaded to and can delete all downloaded files.
 */
class DownloadManager {
  private _downloadsPath: PathLike;

  constructor(downloadPath: PathLike) {
    this._downloadsPath = downloadPath;
    if (!fs.existsSync(this.dir)) {
      this.log(`directory '${this.dir}' doesn't exist, creating...`);
      fs.mkdirSync(this.dir);
      this.log('creation successful!');
    }
  }

  public get dir(): PathLike {
    return this._downloadsPath;
  }

  /**
   * Deletes all the files in the set download path.
   */
  public flush() {
    fs.readdirSync(this.dir).forEach(f => {
      this.log(`deleting ${f}`);
      fs.unlinkSync(path.join(this.dir.toString(), f));
    });
  }

  public listDownloads(): PathLike[] {
    return fs.readdirSync(this.dir).map(n => path.join(this.dir.toString(), n));
  }

  //Private implementations

  private log(msg: string) {
    console.log(`[DownloadManager] ${msg}`);
  }
}

export default DownloadManager;
