function sendMessageCw( message = "", roomID = ROOM_ID_TEST )
{
  const url = `${ CW_ENDPOINT_URL }/rooms/${ roomID }/messages`;
  let options = {
    'method' : 'POST',
    'accept' : 'application/json',
    'headers' : {
      "x-chatworktoken" : CW_API_TOKEN,
      "content-type": "application/x-www-form-urlencoded",
    },
    "muteHttpExceptions" : true,
    'payload' : {
      'body': message,
    },
  };
  let response;
  try {
    response = UrlFetchApp.fetch( url, options );
  } catch( e ) {
    response = e;
  }
  return response;
}

function sendDmCW( message = "", accountId )
{
  const funcName = "sendDmCW";
  if ( !message || !accountId ) {
    throw `[ERROR: ${ funcName }] The both arguments must not be empty.`;
  }
  const id = roomId( accountId );
  sendMessageCw( message, id );
}

function contactsList()
{
  const url = `${ CW_ENDPOINT_URL }/contacts`;
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-chatworktoken': CW_API_TOKEN,
    },
  };
  let response;
  try {
    response = UrlFetchApp.fetch( url, options );
  } catch( e ) {
    response = e;
  }
  if ( debug ) {
    console.log( JSON.parse( response ) );
  }
  return response;
}

function roomId( accountId )
{
  const response = contactsList( accountId );
  const data = JSON.parse( response );
  for ( let i = 0; i < data.length; i++ ) {
    const contact = data[ i ];
    if ( debug ) {
      console.log( contact );
    }
    if ( contact.account_id == accountId ) {
      return contact.room_id;
    }
  }
  return false;
}
