// メタ情報
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 今現在の日時
const NOW_OBJECT = new Date();
const YEAR_NOW = NOW_OBJECT.getFullYear();
const MONTH_NOW = NOW_OBJECT.getMonth() + 1;
const DATE_NOW = NOW_OBJECT.getDate();
const DAY_NOW = NOW_OBJECT.getDay();

// END POINT
const BACKLOG_ENDPOINT_URL = "https://nano-sp.backlog.jp";
const BACKLOG_SPACE_PATH = "/api/v2/space";
const BACKLOG_ACTIVITIES_PATH = "/api/v2/space/activities";

const CW_ENDPOINT_URL = "https://api.chatwork.com/v2";

// シート
const nameListSh = new NameListSheet( "名簿" );

const backlog_changes_status = {
  "1":"未対応",
  "2":"処理中",
  "3":"処理済み",
  "4":"完了"
};

const backlog_changes_priority = {
  "2":"高",
  "3":"中",
  "4":"低"
};

const backlog_changes_resolution = {
  "":"",
  "0":"対応済み",
  "1":"対応しない",
  "2":"無効",
  "3":"重複",
  "4":"再現しない"
};