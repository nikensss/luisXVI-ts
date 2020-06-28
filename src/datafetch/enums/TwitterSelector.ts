const enum TwitterSelector {
  CALENDAR_DROPDOWN = '#daterange-button',
  TWEETS_NAVBAR = '.SharedNavBar--analytics',
  TWEETS_LINK = `//a[contains(text(), 'Tweets')]`,
  EXPORTAR_DATOS = '#export > button > span.ladda-label',
  BY_TWEET = '#export > ul > li:nth-child(1) > button[data-type="by_tweet"]',
  UPDATE = 'div.daterangepicker > div.ranges > div > button.applyBtn',
  CALENDAR = 'div.daterangepicker',
  DATE_RANGE_TITLE = '#daterange-button > span.daterange-selected',
  DATE_RANGES = '.ranges > ul > li',
  CALENDAR_LEFT_PREV = '.calendar.left > .calendar-date > table > thead > tr > th.prev.available',
  CALENDAR_LEFT_TBODY = '.calendar.left > .calendar-date > table > tbody',
  CALENDAR_RIGHT_TBODY = '.calendar.right > .calendar-date > table > tbody',
  CALENDAR_RIGHT_PREV = '.calendar.right > .calendar-date > table > thead > tr > th.prev.available'
}

export default TwitterSelector;
