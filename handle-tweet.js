/*********************************************************************
 * handle-tweet.js
 *
 * Module to analyze and process a tweet from twitter public stream
 * Mainly meant to track word count of 'color' words - red, blue, etc
 * Searches for desired words, processes words, and handles saving to db
 *
 * adam.cahan@gmail.com
 * July 2014
 * **********************************************************************/





/* Function analyzeTweet*****
 * Args: 
 * -tweet - Twitter tweet JSON obj
 * -wordsTracked - array of words (strings) we're interested in, should be of colors     
 *
 * Compares words in a tweet and hashtags against wordsTracked array
 ****************/
var analyzeTweet = function(tweet,desiredWords){

  //Concat the two parts of the tweet we're interested in and make arr of words
  var tweetWords = (tweet.text.concat(tweet.entities.hashtags)).split(" ");
  var dw = desiredWords.length;
  var wl = tweetWords.length;
  debugger;

  //Loop thru and analyze words
  for(var i = 0; i < dw; i++){
    
    debugger;
    for(var j = 0; j < wl; j++){
      debugger; 
      /**/
      if(desiredWords[i] === tweetWords[j]){

        debugger;
        //We have a match! Save to db or whatever
        console.log("A color! We have the match: " + desiredWords[i] + " " + tweetWords[j]);
      }
    }
  }
}
module.exports = analyzeTweet;
