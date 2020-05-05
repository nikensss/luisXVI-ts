import moment, { Moment } from 'moment';
/**
 *  This one convert each line of the csv into a Tweet object, where each attribute represents a tweet feature
 */
class Tweet {
  private _tweet: any;
  private _user: string;
  private _id: string;
  private _tweetPermalink: string;
  private _tweetText: string;
  private _time: Moment;
  private _semester: number;
  private _quarter: number;
  private _fortnight: number;
  private _week: number;
  private _monthName: string;
  private _impressions: number;
  private _engagements: number;
  private _engagementRate: number;
  private _retweets: number;
  private _replies: number;
  private _likes: number;
  private _userProfileClicks: number;
  private _urlClicks: number;
  private _hashtagClicks: number;
  private _detailExpands: number;
  private _permalinkClicks: number;
  private _appOpens: number;
  private _appInstalls: number;
  private _follows: number;
  private _emailTweet: number;
  private _dialPhone: string;
  private _mediaViews: number;
  private _mediaEngagements: number;

  // private _promotedPermalinkClicks: number;
  // private _promotedAppOpens: number;
  // private _ptomotedAppInstalls: number;
  // private _promotedFollows: number;
  // private _promotedEmailTweet: string;
  // private _promotedDialPhone: string;
  // private _promotedMediaViews: number;
  // private _promotedMediaEngagements: number;

  constructor(t: any) {
    this._tweet = t;
    this._id = t['Tweet id'];
    this._tweetPermalink = t['Tweet permalink'];
    this._user = this._tweetPermalink.split('/')[3];
    this._tweetText = t['Tweet text'];
    this._time = moment(t['time'], 'YYYY-MM-DD HH:mm +HHmm');
    this._impressions = parseInt(t['impressions']);
    this._engagements = parseInt(t['engagements']);
    this._engagementRate = parseFloat(t['engagement rate']);
    this._retweets = parseInt(t['retweets']);
    this._replies = parseInt(t['replies']);
    this._likes = parseInt(t['likes']);
    this._userProfileClicks = parseInt(t['user profile clicks']);
    this._urlClicks = parseInt(t['url clicks']);
    this._hashtagClicks = parseInt(t['hashtag clicks']);
    this._detailExpands = parseFloat(t['detail expands']);
    this._permalinkClicks = parseInt(t['permalink clicks']);
    this._appOpens = parseInt(t['app opens']);
    this._appInstalls = parseInt(t['app installs']);
    this._follows = parseInt(t['follows']);
    this._emailTweet = parseInt(t['email tweet']);
    this._dialPhone = t['dial phone'];
    this._mediaViews = parseInt(t['media views']);
    this._mediaEngagements = parseInt(t['media engagements']);

    //Feature engineering
    this._semester = Math.trunc(this._time.month() / 6);
    this._monthName = this._time.format('MMMM');
    this._quarter = this._time.quarter() - 1;
    this._fortnight = Math.trunc(this._time.dayOfYear() / 14);
    this._week = this._time.week();
  }

  toString(): string {
    return `User: ${this.user}; Time: ${this._time}; Text: ${this._tweetText}`;
  }

  public get user(): string {
    return this._user;
  }

  public get year(): number {
    return this._time.year();
  }

  public get semester(): string {
    return 'S' + this._semester;
  }

  public get quarter(): string {
    return 'Q' + this._quarter;
  }

  public get month(): string {
    return 'M' + this._time.month();
  }

  public get monthName(): string {
    return this._monthName;
  }

  public get fortnight(): string {
    return 'F' + this._fortnight;
  }

  public get week(): string {
    return 'W' + this._week;
  }

  public get date(): number {
    return this._time.date();
  }

  public get day(): number {
    return this._time.day();
  }

  public get likes(): number {
    return this._likes;
  }

  public get impressions(): number {
    return this._impressions;
  }

  public get engagements(): number {
    return this._engagements;
  }

  public get retweets(): number {
    return this._retweets;
  }

  public get(prop: string): string | number {
    switch (prop) {
      case 'tweets':
        return 1;
      case 'likes':
        return this.likes;
      case 'impressions':
        return this.impressions;
      case 'user':
        return this.user;
      case 'engagements':
        return this.engagements;
      case 'retweets':
        return this.retweets;
      default:
        throw new Error(`[Tweet] Unknown property "${prop}"`);
    }
  }
}

export default Tweet;
