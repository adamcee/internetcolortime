/*
 * Websockets get handled here. Socket obj instantiated in app.js and passed into this module.
 *
 * Mainly establishing a connection and then streaming color/timestamp data to client
 *
 * adam cahan
 * july 2014
 */


//my_socket_io assigned in app.js ... this may end up being unnecessary but documents nicely express app passing
function getIO(app){
  return app.my_socket_io;
}
