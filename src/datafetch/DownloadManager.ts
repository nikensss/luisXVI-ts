import fs, { PathLike } from 'fs';
import path from 'path';

/**
 * Knows where files are downloaded to and can delete all downloaded files.
 */
class DownloadManager {
  private _downloadPath: PathLike;

  constructor(downloadPath: PathLike) {
    this._downloadPath = downloadPath;
    if (!fs.existsSync(this.path)) {
      this.log(`directory '${this.path}' doesn't exist, creating...`);
      fs.mkdirSync(this.path);
      this.log('creation successful!');
    }
  }

  public get path(): PathLike {
    return this._downloadPath;
  }

  /**
   * Deletes all the files in the
   */
  public flush() {
    fs.readdirSync(this.path).forEach((f) => {
      this.log(`deleting ${f}`);
      fs.unlinkSync(path.join(this.path.toString(), f));
    });
  }

  private log(msg: string) {
    console.log(`[DownloadManager] ${msg}`);
  }
}

export default DownloadManager;
