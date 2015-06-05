/*
 * Websockets get handled here. Socket obj instantiated in app.js and passed into this module.
 * Mainly establishing a connection and then streaming color/timestamp data to client
 */

function getIO(app){
  return app.my_socket_io;
}
