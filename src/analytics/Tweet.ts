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
  private _impresions: number;
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
    this._time = moment(t['time']);
    this._impresions = parseInt(t['impressions']);
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
  }

  toString(): string {
    return `User: ${this.user}; Time: ${this._time}; Text: ${this._tweetText}`;
  }

  get user(): string {
    return this._user;
  }
}

export default Tweet;
