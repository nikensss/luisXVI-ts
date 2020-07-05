import { promises as fs, PathLike } from 'fs';
import Tweet from './Tweet';
import { default as parse } from 'neat-csv';

/**
 * Parses CSV files and returns them as Tweet[].
 */
class CsvHandler {
  private constructor() {}

  public static async parse(path: PathLike): Promise<Tweet[]> {
    const rawCsv = await fs.readFile(path);
    const parsedCsv = await parse(rawCsv);

    return parsedCsv.map(e => new Tweet(e));
  }

  public static async parseMultiple(paths: PathLike[]): Promise<Tweet[]> {
    const tweets: Tweet[] = [];
    for (let path of paths) {
      tweets.push(...(await this.parse(path)));
    }

    return tweets;
  }
}

export default CsvHandler;
