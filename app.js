var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    routes = require('./routes/index'),
    users = require('./routes/users'),
    app = express();


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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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

// for handling twitter public stream and tracking color words
var twitter = require('ntwitter'),
    tHandler = require('./handle-tweet.js')();

/**
 * If using Heroku twitter credentials are set as env vars.
 * You may wish to create and require your own credentials.js file.
 * You must create your own twitter api key and use its credentials.
 */

// twitter stream credentials
var credentials = require('./credentials.js');

// ntwitter obj with authentication.
// If using credentials.js, do like so: consumer_key: credentials.consumer_key
var twit = new twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

/***************************************************
//Attempting an approach to socket.io on heroku from:
//https://github.com/mongolab/tractorpush-server/blob/master/app.js
//My original code (works fine w/foreman locally, and non-heroku, commented out for now. 9-20-14

//Including port 5000 because it is the Heroku default
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app);

theport = process.env.PORT || 2000;
app.listen(theport);
console.log("http server on port:" + theport);

function handler(req, res){
  fs.readFile(__dirname + "/public/coloroftheday.html",
      function(err,data){
        if(err){
          res.writeHead(500);
          return res.end("Error loading coloroftheday.html");
          }
            res.writeHead(200);
            res.end(data);
        });
}
************************/

var port = process.env.PORT || 2000,
    server,
    io,
    // This is our 'unit of time' - streaming to client every timeInterval seconds
    timeInterval = 4,
    colors = require('./color-list.json');

server = app.listen(port, function(){
    //TODO: %d %s not always getting replaced
    console.log("Express listening on port %d in %s mode. Port is: " + port);
});

io = require('socket.io').listen(server);

console.log('socket.io created');
console.log('colors loaded');

/**
 * Connect to Twitter Public Stream and track color keywords.
 * Handle keywords by emitting to client via websocket, and saving to DB.
 *
 * Not 100% sure if this architecture (handling tweetstream in app.js) is ideal...
 *
 * --Steps--
 * run twitter stream tracking colors
 * on stream data, pass to handler function
 * handler function returns json objs w/color&timestamp
 * stream json objs via socket.io (where do i set up io.sockets.on('connection')??
 * save colordata to database w/database module
 */

//TODO: Break into separate modules

io.on('connection', function(socket){
    io.emit('test', "hello!");
    io.on('disconnect', function(){
        console.log('socket.io disconnected');
    });
});

function showTweet(tweet){
    setTimeout(function(){
        console.log(tweet.text);
    },3000);
}
//TODO: Check out colorhexa.com....
//use instead of 'colors' file to pull a full color list?
//Then will have to parse for 'summer blue', etc

var startTime = getTimeStamp(),
    colorBuffer = [];

//pull and handle the Twitter stream
twit.stream('statuses/filter', {track: colors}, function(stream){
  stream.on('data', function(tweet){    
      showTweet(tweet);

      //Aggregate tweets over our time interval (should be 4 seconds)
      if(!intervalPassed(startTime, timeInterval)){
        //return arr of all 'color words' in tweet and add to array
        colorBuffer = colorBuffer.concat(tHandler.parse(tweet, colors));
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


/**** Functions ****/

function makeColorStamp(colorModeObj, start, end){
    var colorStamp = {
        modeColors: colorModeObj.modeColors,
        modeCount: colorModeObj.modeCount,
        allColors: colorModeObj.allColors,
        start: start,
        end: end
    };
    return colorStamp;
}

function getTimeStamp(){
    return Math.round(Date.now()/1000);
}

function intervalPassed(startTime, timeInterval){
    return (getTimeStamp() - startTime < timeInterval) ? false : true;
}

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
    twit.verifyCredentials(function(err, data){
        if(err){
            console.log("Error! "+err);
        }
        else{
            console.log(data);
        }
    });
};

function testStream(){
    twit.stream('statuses/sample', function(stream){
        stream.on('data',function(data){
            console.log(data);
        });
    });
}

//Exports for app.js
module.exports = app;
