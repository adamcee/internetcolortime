/*
 * Testing out pulling data from Twitter Public Stream
 */
debugger;
console.log('in app');


/*Vars and objs*/
var twitter = require('ntwitter');
var analyzeTweet = require('./handle-tweet.js');

var colors = require('./color-list.js');//all colors we want
var credentials = require('./credentials.js');//twitter stream auth

debugger;

/*Make ntwitter obj with authentication for twitter public stream*/
var twit = new twitter({
  consumer_key: credentials.consumer_key,
  consumer_secret: credentials.consumer_secret,
  access_token_key: credentials.access_token_key,
  access_token_secret: credentials.access_token_secret
});


/*Guts of the operation....*/

/*Where we actually pull and handle the Twitter stream*/
//Have to replace the array here with var from module somewhere w/list of all colors??
//Check out colorhexa.com....
twit.stream('statuses/filter', {track: colors}, 

    //Callback to handle twitter stream we've created
    function(stream){
      //When data event emitted from stream
      debugger;
      stream.on(
        'data', 
        function(tweet){
          //Callback - process text & save to db...
          analyzeTweet(tweet,colors);
        });
    }
);

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

