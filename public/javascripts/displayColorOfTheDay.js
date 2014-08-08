/* * Generate rounded shapeangles - 'swatches' - for Color of the Day * Combine them into some sort of group - 'palettes' - so a gradient between the different colors can be constructed */

/***EVEN NEWER CONSTRUCTOR...************/
function newSwatchSpace(pixelWidth, pixelHeight, xSpace, ySpace){

  var ss = {
    //vars
    width: pixelWidth,
    height: pixelHeight,
    xSpace: xSpace,
    ySpace: ySpace,
    swatchSize: null,//Will be replaced w/paper.js Size obj on init
    firstPoint: null,//will be replaced w/paper.js Point obj on init
    swatchFull: false,//true if all gridpoints in swatch are 'filled', i.e. rendered
    //more vars...arrs to store stuff
    paperLayers: [],
    swatches: [],
    centerPoints:  [],
    pointer_cp: 0,//pointer for centerPoints arr to track most recently created swatch
    
    //funcs -- NOTE: I NEED TO GET THIS FUNC AND THE GENEREATECENTERPOINTS WORKING RIGHT....
    setSwatchSize: function(){
                     this.swatchSize = new Size(this.width/this.xSpace, this.height/this.ySpace);
    },

    //Must be run after setSwatchSize
    setTopLeftPoint: function(){
                       this.firstPoint = new Point(view.center.x/(this.xSpace),view.center.y/(this.ySpace));
                     },

    testSwatchSize: function(){//test func
                      console.log('testing swatch size...');
                      var x = this.width/this.xSpace;
                      console.log('x is ',x);
                          y = this.height/this.ySpace;
                      this.swatchSize = x ;
                    },
  
    //Generate center point for each swatch grid point
    generateCenterPoints:  function(){
      console.log("Making center points...");
      console.log('in func swatchsize is ', this.swatchSize); 
      console.log('xspace and yspace vals are '+this.xSpace+ ' '+this.ySpace);
      console.log('swatchspace is '+this.width+' '+this.height);
      console.log('firstPoint is ',this.firstPoint);
      var daPoint = this.firstPoint.clone();//counter point, sort of..

      //Loop thru all grid points and generate center points
      for(var y = 0; y < this.ySpace;y++){
        
        for(var x = 0; x < this.xSpace;x++){
          this.centerPoints.push(daPoint.clone());//copies Point adds to arr
          daPoint.x += this.swatchSize.width;//gives us x-pos of centerpoint for this grid square    
        }
        daPoint.y += this.swatchSize.height;//same as above, but for y
        daPoint.x = this.firstPoint.x;//reset for the next round of looping...
      }
    },

    //Applies a swatch-rendering function of choice to draw Swatch at a given point
    drawSwatch:  function(centerPoint, size, color, renderFunc){
      renderFunc(centerPoint, size, color);
    },

    //Draw swatch @ centerpoint[pointer_cp] - used to fill swatchspaces in an order..
    //Checks pointer position and will not draw once array size is reached
    //Returns true on successful draw and false on max reached
    drawNextSwatch:  function(color, renderFunc){
     
      if(this.pointer_cp < this.centerPoints.length){
        this.drawSwatch(this.centerPoints[this.pointer_cp],this.swatchSize,color,renderFunc);
        this.pointer_cp +=1;
        console.log('drawing gridPos ',this.pointer_cp);
        return true;
      }
      else{
        this.swatchFull = true;
        return false;
      }
    },

    //Like drawNextSwatch but 'loops' - draws over from initial pos once swatchspace is full
    //Return statement is an anachronism BUT allows this to be interchanged w/drawNextSwatch easily
    drawSwatchesForever:  function(color, renderFunc){
     
      if(this.pointer_cp < this.centerPoints.length){
        this.drawSwatch(this.centerPoints[this.pointer_cp],this.swatchSize,color,renderFunc);
        this.pointer_cp +=1;
        console.log('drawing gridPos ',this.pointer_cp);
        return true;
      }
      //reset and draw from the top
      else{
        this.pointer_cp = 0;
        return true;
      }
    }

  }//close ss obj 

  //Do the pseudo-classical constructor-type stuff....
  //ss.testSwatchSize();
  ss.setSwatchSize();
  ss.setTopLeftPoint();
  ss.generateCenterPoints();
  console.log('swatchsize width is...',ss.swatchSize.width);

  return ss;
}//end newSwatchSpace func

//Constructor function
function SwatchSpace(width, height, colorsArr){
  this.width = width;
  this.height = height;
  this.swatchColors = colorsArr;
}


/*
 * Create a color swatch. 
 * Params: center point of swatch (Paper.js Point obj), size (Paper.js Size obj), color (can be Paper.js color)
 * Returns: Paper.js Group which can be used to manipulate the swatch
 */
function createSwatch(centerPoint, theSize, color){

    console.log('running createswatch2');
    var borderColor = 'white';//color of the swatch border

    //Create outer shape
    var shape = new Rectangle([0, 0], theSize);
    var cornerSize = new Size(80,80);
    var path = new Path.Rectangle(shape, cornerSize);

    //Create inner shape to get a nice swatch with a double stroke. Inner shape proportionate to outer shape
    var innerShape = shape.clone();
    var shapeOffSet = 60;
    innerShape.width -= shapeOffSet;
    innerShape.height -= shapeOffSet; 
    var innerCornerSize = cornerSize - 25;//The #25 determined by trial&error
    innerShape.center = shape.center;
    var innerShapePath = new Path.Rectangle(innerShape, innerCornerSize);
    innerShapePath.strokeColor = borderColor;
    innerShapePath.strokeWidth = 40;//strokeWidth also determined by trial&error

    //Create a group for our Swatch and apply position & color
    mySwatch = new Group([path, innerShapePath]);
    mySwatch.position = centerPoint;
    mySwatch.fillColor = color;

    //Return the Group so it can be used
    return mySwatch;
}

function createSwatch2(centerPoint, theSize, color){

    var borderColor = 'white';//color of the swatch border

    //Create outer shape
    var shape = new Rectangle([0, 0], theSize);
    var cornerSize = new Size(10,10);
    var path = new Path.Rectangle(shape, cornerSize);

    //Create inner shape to get a nice swatch with a double stroke. Inner shape proportionate to outer shape
    var innerShape = shape.clone();
    var shapeOffSet = 6;
    innerShape.width -= shapeOffSet;
    innerShape.height -= shapeOffSet; 
    var innerCornerSize = 9;//The #25 determined by trial&error
    innerShape.center = shape.center;
    var innerShapePath = new Path.Rectangle(innerShape, innerCornerSize);
    innerShapePath.strokeColor = borderColor;
    innerShapePath.strokeWidth = 4;//strokeWidth also determined by trial&error

    //Create a group for our Swatch and apply position & color
    mySwatch = new Group([path, innerShapePath]);
    mySwatch.position = centerPoint;
    mySwatch.fillColor = color;

    //Return the Group so it can be used
    return mySwatch;
}
//Redraw the canvas and everything in it to new size on page resize
function onResize(event){
  //path.position = view.center;


  //view info for debug
  console.log('viewsize - '+view.viewSize);
  console.log('view bounds - ' +view.bounds);
  console.log('view center  - ' + view.center);
}

/********************************Test Code********************************
 * ************************************************************************/


//Properties of the coordinate space we are displaying our swatches in
/*Set Canvas width and height - eventually these should be derived from CSS container of canvas*/
var canWidth = 1000;
var canHeight = 500;
view.viewSize.width = canWidth;
view.viewSize.height = canHeight;

/***
var swatchSpace = new SwatchSpace(canWidth-50, canHeight-100, ['red','yellow','green','blue']);
var numSwatches = swatchSpace.swatchColors.length, i = 0;

sPoint = new Point(view.center.x/2,view.center.y);

var theSwatch = createSwatch(sPoint,[swatchSpace.width/2, swatchSpace.height],'blue'); 
var otherSwatch = createSwatch(new Point(view.center.x*1.5, view.center.y), [swatchSpace.width/2,swatchSpace.height],'green');
***/

//Testing out the newer swatchspace class
var coolnewswatchspace = newSwatchSpace(canWidth, canHeight, 5,3);
console.log('made coolswatch');
//setting a var func for drawing...
var funcpass = createSwatch2;
var cpArr = coolnewswatchspace.centerPoints;
var cools = coolnewswatchspace;

//Timer object to help with animation...
var Animator = Animator || {};

  
while(!cools.swatchFull){
  setTimeout(cools.drawNextSwatch('green', funcpass),500000);
}
/**/

console.log('cools w and h '+cools.swatchSize.width+' '+cools.swatchSize.height);
console.log('widht and height are:  '+cools.width+' '+cools.height);

/********************************
 * WEBSOCKET STUFF AND ANIMATION STUFF
 * ******************************/


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

  //Draw a swatch!!!!
  var swatchColor = colorstamp.modeColors[0];//for now ignore ties..
  cools.drawSwatchesForever(swatchColor, funcpass);
  view.update();
  
});//close socket.on('colorstamp'
