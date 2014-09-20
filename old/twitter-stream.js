/*
 * Testing out pulling data from Twitter Public Stream
 */
debugger;
console.log('in twitter-stream.js');

/*Vars and objs*/
var twitter = require('ntwitter');
var handleTweet = require('./handle-tweet.js');

var colors = require('./color-list.js');//all colors we want

/*Unneeded for Heroku deployment (twitter secrets/keys in env vars. 
 *To run locally create your own credentials.js file and uncomment - see below for guidance on credentials.js file.
var credentials = require('./credentials.js');//twitter stream auth
 */

debugger;

/*Make ntwitter obj with authentication for twitter public stream
 *Currently configured for Heroku - keys/secrets are Heroku environment vars.
  For use on server set up credentials.js file with secrets/keys and require
  */
var twit = new twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: procee.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});


/*Guts of the operation....*/

/*Where we actually pull and handle the Twitter stream*/
//Have to replace the array here with var from module somewhere w/list of all colors??
//Check out colorhexa.com....

twit.stream('statuses/filter', {track: colors}, function(stream){
  //When data event emitted from stream
  debugger;
  stream.on('data', function(tweet){
      //Callback - process text & save to db...

      //handleTweet needs to return colors data...
      handleTweet(tweet,colors);

      //Stream colors data to client

      //Save colors data to db
  });
});

/*Test Functions*/    
var testConn =  function(){
  twit.verifyCredentials(function(err,data){
    if(err){
      console.log("Error! "+err);
    }
    else{
      console.log(data);
    }
  });
}

function testStream(){
  twit.stream('statuses/sample', function(stream){
    stream.on('data',function(data){
      console.log(data);
    });
  });
}

