function requestBacklog( path, apiKey = API_KEY )
{
  let options = {
    'method' : 'GET',
    'accept' : 'application/json',
    'headers' : {
      "content-type": "application/x-www-form-urlencoded",
    },
    "muteHttpExceptions" : true,
  };
  let response;
  try {
    response = UrlFetchApp.fetch( BACKLOG_ENDPOINT_URL + path + "?apiKey=" + apiKey, options );
  } catch( e ) {
    response = e;
  }
  return response;
}

function doPost( e )
{
  const funcName = "doPost";
  if ( e.postData.contents ) {
    const body = JSON.parse( e.postData.contents );
    if ( debug ) {
      console.log( `[DEBUG: ${ funcName }] body ↓` );
      console.log( body );
    }
    const messageObject = makeChatMessage( body );
    if ( debug ) {
      console.log( `[DEBUG: ${ funcName }] messageObject ↓` );
      console.log( messageObject );
      console.log( `[DEBUG: ${ funcName }] body.createdUser ↓` );
      console.log( body.createdUser );
    }
    const userName = body.createdUser.name;
    const memberOn = nameListSh.getMember( userName, "name" );
    if ( !memberOn ) {
      throw `[ERROR: ${ funcName }] The name is not detected.`;
    }
    if ( debug ) {
      console.log( `[DEBUG: ${ funcName }] memberOn ↓` );
      console.log( memberOn );
    }
    // リマインドメッセージの組み立て
    let message = `[To:${ memberOn[ 1 ] }] ${ memberOn[ 0 ] }さん\n`;
    message += messageObject.message + "\n";
    if ( messageObject.comment ) {
      message += messageObject.comment + "\n";
    }
    if ( messageObject.description ) {
      message += messageObject.description + "\n";
    }
    if ( messageObject.changes ) {
      message += messageObject.changes + "\n";
    }
    if ( debug ) {
      console.log( `[DEBUG: ${ funcName }] message: ${ message }` );
    }
    sendDmCW( message, memberOn[ 1 ] );
  } else {
    throw `[ERROR: ${ funcName }] 対象チャンネルが指定されていないか、データが取得できません。`;
  }
}

function makeChatMessage( body )
{
  var msgObj = new Object();
  var label = "";
  var bl_key = "";
  var bl_summary = "";
  var bl_comment = "";
  var bl_url = "";
  var bl_to ="";
  var bl_changes = "";
  var bl_description = "";

  switch ( body.type ) {
    case 1:
      label = "追加";
      bl_key = "[" + body.project.projectKey + "-" + body.content.key_id + "]";
      bl_summary = "「" + body.content.summary + "」";
      bl_url = BACKLOG_ENDPOINT_URL + "view/" + body.project.projectKey + "-" + body.content.key_id;
      bl_description = body.content.description;
      break;
    case 2:
      label = "更新";
      bl_key = "["+body.project.projectKey+"-"+body.content.key_id+"]";
      bl_summary = "「" + body.content.summary + "」";
      bl_url = BACKLOG_ENDPOINT_URL+"view/"+body.project.projectKey+"-"+body.content.key_id;
      if(body.content.changes.length > 0){
        for(var c = 0; c < body.content.changes.length; c++){
          switch (body.content.changes[c].field){
            case 'status':
              bl_changes += "・状態を「"+backlog_changes_status[body.content.changes[c].old_value]+"」から「"+backlog_changes_status[body.content.changes[c].new_value]+"」に変更しました。\n";
              break;
            case 'priority':
              bl_changes += "・優先度を「"+backlog_changes_priority[body.content.changes[c].old_value]+"」から「"+backlog_changes_priority[body.content.changes[c].new_value]+"」に変更しました。\n";
              break;
            case 'assigner':
              bl_changes += "・担当者を"+body.content.changes[c].old_value+"から"+body.content.changes[c].new_value+"に変更しました。\n";
              break;
            case 'component':
              bl_changes += "・カテゴリを「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'description':
              bl_changes += "・説明文を変更しました。\n";
              bl_description += body.content.changes[c].new_value;
              var stringChangeLength = body.content.changes[c].new_value.length-body.content.changes[c].old_value.length;
              var oldarr = body.content.changes[c].old_value.split("");
              var newarr = body.content.changes[c].new_value.split("");
              if(stringChangeLength==0){
                for(var i in oldarr){
                  if(oldarr[i]!=newarr[i]){
                    if(newarr[i-1]=="["&&newarr[i]=="x"){
                      msgObj = false;
                      return msgObj;
                    }
                  }
                }
              }
              break;
            case 'issueType':
              bl_changes += "・issueTypeを「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'summary':
              bl_changes += "・課題名を「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'limitDate':
              bl_changes += "・期限日を「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'startDate':
              bl_changes += "・開始日を「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'resolution':
              bl_changes += "・完了理由を「"+backlog_changes_resolution[body.content.changes[c].old_value]+"」から「"+backlog_changes_resolution[body.content.changes[c].new_value]+"」に変更しました。\n";
              break;
            case 'version':
              bl_changes += "・発生バージョンを「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'milestone':
              bl_changes += "・マイルストーンを「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'attachment':
              bl_changes += body.content.changes[c].new_value+"を添付しました。\n";
              break;
            case 'estimatedHours':
              bl_changes += "・予定時間を「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            case 'actualHours':
              bl_changes += "・実績時間を「"+body.content.changes[c].old_value+"」から「"+body.content.changes[c].new_value+"」に変更しました。\n";
              break;
            default:
              return;
          }
        }
        if(body.content.comment.content){
          bl_comment += body.content.comment.content;
        }
      }
      break;
    case 3:
      label = "コメント";
      bl_key = "["+body.project.projectKey+"-"+body.content.key_id+"]";
      bl_summary = "「" + body.content.summary + "」";
      bl_url = BACKLOG_ENDPOINT_URL + "/view/" + body.project.projectKey + "-" + body.content.key_id + "#comment-" + body.content.comment.id;
      bl_comment = body.content.comment.content;
      break;
    case 14:
      label = "課題まとめて更新";
      bl_key = "";
      bl_summary = "";
      bl_url = BACKLOG_ENDPOINT_URL+"projects/"+body.project.projectKey;
      bl_comment = body.createdUser.name+"さんが課題をまとめて操作しました。";
      break;
    case 5:
      label = "Wiki追加";
      bl_key = "";
      bl_summary = "「"+body.content.name+"」";
      bl_url = BACKLOG_ENDPOINT_URL+"alias/wiki/"+body.content.id;
      bl_comment = body.createdUser.name+"さんがWikiページを追加しました。";
      break;
    case 6:
      label = "Wiki更新";
      bl_key = "";
      bl_summary = "「"+body.content.name+"」";
      bl_url = BACKLOG_ENDPOINT_URL+"alias/wiki/"+body.content.id;
      bl_comment = body.createdUser.name+"さんがWikiページを更新しました。";
      break;
    case 11:
      label = "SVNコミット";
      bl_key = "[r"+body.content.rev+"]";
      bl_summary = "";
      bl_url = BACKLOG_ENDPOINT_URL+"rev/"+body.project.projectKey+"/"+body.content.rev;
      bl_comment = body.content.comment;
      break;
    case 12:
      label = "Gitプッシュ";
      var git_rev = body.content.revisions[0].rev;
      git_rev = git_rev.substr(0,10);
      bl_key = "["+git_rev+"]";
      bl_summary = "";
      bl_url = BACKLOG_ENDPOINT_URL+"git/"+body.project.projectKey+"/"+body.content.repository.name+"/"+body.content.revision_type+"/"+body.content.revisions[0].rev;
      bl_comment = body.content.revisions[0].comment;
      break;
    case 18:
      label = "プルリクエスト追加";
      bl_key = "( 担当:"+body.content.assignee.name+" )";
      bl_summary = "「"+body.content.summary+"」";
      bl_url = BACKLOG_ENDPOINT_URL+"git/"+body.project.projectKey+"/"+body.content.repository.name+"/pullRequests/"+body.content.number;
      bl_comment = body.content.description;
      break;
    case 19:
      label = "プルリクエスト更新";
      bl_key = "( 担当:"+body.content.assignee.name+" )";
      bl_summary = "「"+body.content.summary+"」";
      bl_url = BACKLOG_ENDPOINT_URL+"git/"+body.project.projectKey+"/"+body.content.repository.name+"/pullRequests/"+body.content.number;
      bl_comment = body.content.description;
      break;
    case 20:
      label = "プルリクエストコメント";
      bl_key = "( 担当:"+body.content.assignee.name+" )";
      bl_summary = "";
      bl_url = BACKLOG_ENDPOINT_URL+"git/"+body.project.projectKey+"/"+body.content.repository.name+"/pullRequests/"+body.content.number+"#comment-"+body.content.comment.id;
      bl_comment = body.content.comment.content;
      break;
    default:
      return;
  }
  if(bl_comment=="//"){
    msgObj = false;
    return msgObj;
  }
  if(body.notifications.length > 0){
    bl_to += "_to ";
    for(var i = 0; i < body.notifications.length; i++){
      bl_to += "@"+body.notifications[i].user.nulabAccount.uniqueId+" ";
    }
  }
  if(label){
    msgObj['message'] = "Backlogによる通知\n";

    if(bl_to != ""){
      msgObj['message'] += bl_to+"\n";
    }

    msgObj['message'] += bl_key+" "
      + label
      + bl_summary
      + " by "
      + body.createdUser.name
      + "\n "+bl_url;
    msgObj['comment'] = bl_comment;
    msgObj['description'] = bl_description;
    msgObj['changes'] = bl_changes;
  }
  return msgObj;
}