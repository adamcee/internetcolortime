var socket = io.connect('http://localhost:9099');

socket.on('test', function(data){
  console.log("We got a websocket message: ", data);
});

socket.on('colorstamp', function(colorstamp){
  
  console.log('Received colorstamp! start: '+colorstamp.start+ ' end: '+colorstamp.end);
  
  colorstamp.modeColors.forEach(function(color){console.log("Top color is: ",color)});
  console.log('Count of top color is: ',colorstamp.modeCount);

  var allColors = colorstamp.allColors;
  var colorKeys = Object.keys(allColors);

  console.log('Additional colors.....');
  for(var i = 0; i< colorKeys.length; i++){
    var color = colorKeys[i];
    console.log(color +' -- ' +allColors[color]);
  }
  //console.log(Object.keys(allColors));
  
});//close socket.on('colorstamp'
