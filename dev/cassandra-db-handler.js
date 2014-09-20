/**
 * Handler file for the Cassandra DB
 *
 * Handles reading to and writing from database
 *
 * DB Schema is:
 *
 * Dynamic Row    | Column
 * ---------------------------
 * ColorName:Date->{timestamp}
 * 
 * Adam Cahan
 * 7.20.14
 */
var moment = require('moment');//date and time library


var cql = require('node-cassandra-cql');
var client = new cql.Client({hosts:['localhost'], 
                             keyspace: 'coloroftheday',
                             username: 'cassandra',
                             password: 'cassandra'});

/***** Function logWord
 * *
 * Saves log of when a color was tweeted to the database
 * Automatically generates a timestamp (this is close enough to actual tweet time)...
 * ...and saves the name of the color and the timestamp to the database.
 * Args:
 * -color: String, a color
 * ***************************/
var logWord = function(color){

  //I know it's lame to make 2 timestamp calls....
  var timestamp = moment().format();
  var date = moment().format('YYYY-MM-DD');

  client.execute("INSERT INTO color (color_name, date,tweet_time) VALUES (?,?,?)",
                 [color,date,timestamp],
                 function(err,result){
                   if(err){
                     console.log("Error! ",err);
                   } else{
                     console.log("Success! ",result)
                   }
                 });
}//end func logWord

//Expose our module...
module.exports.logWord = logWord;
