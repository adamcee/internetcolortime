console.log('start');
th = require('./handle-tweet.js');
tweethandler = th();
console.log('ya');

for(var m in tweethandler){
  console.log('we have a ',m)
}
var arr =['three','one','five','two','one','four',6,11,14,6,5,5,3,3,'three','two','one','three','three','one']; 

arr.forEach(function(val){
  console.log(val);
});

var result = tweethandler.mode(arr);

result.modes.forEach(function(amode){

  console.log('result is ',amode);

});
console.log('count is ', result.count);
