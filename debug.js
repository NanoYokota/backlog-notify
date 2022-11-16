function test()
{
  const response = requestBacklog( BACKLOG_ACTIVITIES_PATH, TEST_API_KEY );
  const data = JSON.parse( response );
  console.log( data[ 0 ].content.comment.content );
}