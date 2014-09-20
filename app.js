var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*******************************************************
 * Non-generic part of app.js specific to my application
 * *****************************************************/

//for handling twitter public stream and tracking color words
var twitter = require('ntwitter');
var tHandler = require('./handle-tweet.js')();
/* Using Heroku - Twitter credentials set as env vars. You may wish to create and require 
 * your own credentials.js file. You must create your own twitter api key and use its credentials.
var credentials = require('./credentials.js');//twitter stream auth */

//ntwitter obj with authentication. Pulled from env vars. If using credentials.js, do like so: consumer_key: credentials.consumer_key
var twit = new twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

//Including port 5000 because it is the Heroku default
var port = process.env.PORT || 5000;
var server = app.listen(port, function(){
  console.log("Express listening on port %d in %s mode.") //%d %s not always getting replaced...minor issue
});
var io = require('socket.io').listen(server);

//moment.js handles time
var moment = require('moment');


//This is our 'unit of time' - streaming to client every timeInterval seconds
var timeInterval = 4;

//Array with all colors we want
var colors = require('./color-list.js');

/* Connect to Twitter Public Stream and track color keywords. 
 * Handle keywords by emitting to client via websocket, and saving to DB.
 *
 * Not 100% sure if this architecture (handling tweetstream in app.js) is ideal...
 *
 * --Order of Operations--
 * run twitter stream tracking colors
 * on stream data, pass to handler function
 * handler function returns json objs w/color&timestamp
 * stream json objs via socket.io (where do i set up io.sockets.on('connection')??
 * save colordata to database w/database module
 */

//NOTE: CopyPasta time! I'd like this all to be separated in modules but just want to get the darn thing running...

/**/
io.on('connection', function(socket){
  io.emit('test', "hello!");
  
  io.on('disconnect', function(){
    console.log('socket.io disconnected');
  });
});
/**/

function showTweet(tweet){
  setTimeout(function(){
    console.log(tweet.text);
  },3000);
}
//Check out colorhexa.com....use instead of 'colors' file to pull a full color list? Then will have to parse for 'summer blue', etc

startTime = getTimeStamp(); 
var colorBuffer = [];

//pull and handle the Twitter stream
twit.stream('statuses/filter', {track: colors}, function(stream){
  stream.on('data', function(tweet){    
      //console.log(tweet.text);
      showTweet(tweet);
      //console.log('TWEET');

      //Aggregate tweets over our time interval (should be 4 seconds)
      if(!intervalPassed(startTime, timeInterval)){
        //return arr of all 'color words' in tweet and add to array
        colorBuffer = colorBuffer.concat(tHandler.parse(tweet, colors));
        //debug
        //console.log('not yet, diff is ', (getTimeStamp()-startTime));
        //colorBuffer.forEach(function(color){console.log('we have a ',color)});
      }

      //Our time interval is completed, reset for next time interval
      else{
        var endTime = getTimeStamp();

        //Another Asynch function to process data and stream to client....
        //?????NOT SURE. Maybe needed to not 'drop' tweets - but not going to prematurely optimize

        //Build colorStamp obj
        var colorModeObj = tHandler.mode(colorBuffer);
        console.log('COLORMODEOBJ: count is : ',colorModeObj.modeCount);
        colorModeObj.modeColors.forEach(function(color){console.log('...',color)});

        var colorStamp = makeColorStamp(colorModeObj, startTime, endTime);

        //stream to client
        io.emit('colorstamp', colorStamp);

        //Reset starTime to trigger next round of parsing & storing, reset buffers
        startTime = endTime;
        colorBuffer = [];

        //debug
        //console.log('done. end time is: '+endTime+' colorBuffer size is '+colorBuffer.length);
      }  

      //var colorTimeArr = handleTweet(tweet,colors);//func returns array of little color/timestamp objs..
      
    });//close stream.on('data'
});//close twit.stream

/**
var tStream = twit.stream('statuses/filter', {track: colors});
   
io.on('connection', function(socket){
 
  tSTream.on('tweet', function(stream){
    stream.on('data', function(tweet){ //stream to client & save to db
    var colorTimeArr = handleTweet(tweet,colors);//func returns array of little color/timestamp objs..

    //stream to client
    });
  });
 

}); 
**/

/**** colorStamp and related Functions ****/

function makeColorStamp(colorModeObj, start, end){
  var colorStamp = {modeColors: colorModeObj.modeColors, 
                    modeCount: colorModeObj.modeCount,
                    allColors: colorModeObj.allColors,
                    start: start, 
                    end: end
  };
  return colorStamp;
}

/**** Time-handling Functions ****/

function getTimeStamp(){
  return Math.round(Date.now()/1000);
}

function intervalPassed(startTime, timeInterval){
  if( (getTimeStamp() - startTime) < timeInterval){
    return false;
  } else{
    return true;
  }
}


/**** Test Functions ****/    

function testColorTimeArr(colorTimeArr){
    var ctLen = colorTimeArr.length;
    
    console.log("TEST: ctLen is ",ctLen);
    if(ctLen > 0){
      for(var i = 0; i< ctLen; i++){
        var ct = colorTimeArr[i];
        console.log("TEST: Color - " + ct.color + ' Time - ' + ct.timestamp); 
        //Stream colors data to client
      } 
      //Save colors data to db
    }
}

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


//Exports for app.js
module.exports = app;
