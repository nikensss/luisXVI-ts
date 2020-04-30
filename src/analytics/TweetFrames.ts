import { PathLike } from 'fs';
import path from 'path';

class CsvHandler {
  /*
  This class parse a bunch of csv files
  */
  public static readonly DOWNLOAD_PATH: PathLike = path.join(__dirname, 'downloads');
  constructor() {}
}

class Tweet {
  /*
  This one convert each line of the csv into a Tweet object, where each attribute represents a tweet feature
  */
  constructor() {}
}

class TweetFrames {
  /*
  TweetFrames join all Tweet objects in a single object.
  */
  constructor() {}
}
