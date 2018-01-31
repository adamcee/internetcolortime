/*********************************************************************
 * handle-tweet.js
 *
 * Module to analyze and process a tweet from twitter public stream
 * Mainly meant to track word count of 'color' words - red, blue, etc
 * Searches for desired words, processes words, and handles saving to db
 *
 * INSTRUCTIONS: Call the requirement (or the var its passed to) as a function to initialze.
 * EX:
 * var th = require('handle-tweet.js')();
 * OR....
 * var th = require('handle-tweet.js')
 * tweethandler = th();
 *
 * adam.cahan@gmail.com
 * July 2014
 * **********************************************************************/


/* Function
 * Args:
 *  tweet -- Twitter tweet JSON obj
 *  desiredWords --  array of words (strings) we're interested in, should be of colors
 *
 * Returns:
 *  String array containing all instances of all 'desired words' in the tweet
 * NOTE: 'colors' and 'colorWords' equiv to desiredWords - assuming all desired words are color-words
 *****************************************/
var parse = function(tweet, desiredWords){

  //console.log('in func');

  var tweetWords = tweet.text.split(" ");//tweet body
  var dw = desiredWords.length;
  var wl = tweetWords.length;
  var parsedWords = [];//hold all words we parse from tweet

  for(var i = 0; i < dw; i++){
    for(var j = 0; j < wl; j++){
      if(desiredWords[i] === tweetWords[j]){
      parsedWords.push(desiredWords[i]);
      }
    }
  }
  return parsedWords;
}

/*
 * Think this was earlier version of parse(). Doublecheck and delete
 */
var getDesiredWords = function(tweet,desiredWords){

  //Concat the two parts of the tweet we're interested in and make arr of words
  var tweetWords = tweet.text;
  var dw = desiredWords.length;
  var wl = tweetWords.length;
  var colorsAndTime = [];//store color/time matches

  /**NOTE: TIMESTAMP DOES NOT PRESERVE TIMEZONE! CHANGE TO DATETIME?**/
  var colors = [];
  var colorsAndTime = {colors: colors, timestamp: parseTwitterDate(tweet)};
  //Loop thru and analyze words
  for(var i = 0; i < dw; i++){
    for(var j = 0; j < wl; j++){
      if(desiredWords[i] === tweetWords[j]){

        //We have a match! Add a 'colorstamp to array to return....
        colors.push(desiredWords[i]);

        console.log("A color! We have the match: " + desiredWords[i] + " " + tweetWords[j]);
        console.log("Tweeted at: ", colorsAndTime.timestamp);
      }
    }
  }

  console.log("colorsAndTime -- timestamp -- "+colorsAndTime.timestamp);
  for(var i = 0; i < colorsAndTime.colors.length; i++){
    console.log(colorsAndTime.colors[i]);
  }
  return colorsAndTime;
}

/* Function
 * Traverses an array. Returns obj with:
 *                                      size of the mode
 *                                      array of most common value(s if tie) (mode) in array.
 *
 * Derived from and thanks to: http://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
 * Args:
 *  array -- array of strings and/or numbers. Should be 'color words'
 */
var mode = function(array){
  if(array.length == 0)
    return null;

  var modeMap = {}, maxCount = 1, modes = [array[0]], len = array.length;

  for(var i = 0;i < len; i++){

    var el = array[i];

    if(modeMap[el] == null)
      modeMap[el] = 1;
    else
      modeMap[el] += 1;

    if(modeMap[el] > maxCount){
      modes = [el];
      maxCount = modeMap[el];
    }
    else if(modeMap[el] == maxCount){
      modes.push(el);
      maxCount = modeMap[el];
    }
  }
  var modeObj = { modeColors: modes, modeCount: maxCount, allColors: modeMap};
  return modeObj;
}


/* Parse twitter created_at date format. Return timestamp in SECONDS
 * Thanks to http://www.quietless.com/kitchen/format-twitter-created_at-date-with-javascript/
 */
function parseTwitterDate(tweet){
  var dadate = new Date(Date.parse(tweet.created_at));
  return dadate/1000;//JS does time since epoch in ms, most other stuff in seconds
}


/* Function
 * Initializer to give us all our methods, etc
 */
var create = function(){
  var tw = {};

  tw.getDesiredWords = getDesiredWords;
  tw.mode = mode;
  tw.parse = parse;
  tw.parseTwitterDate = parseTwitterDate;

  return tw;
}

//Exports
module.exports = create;
