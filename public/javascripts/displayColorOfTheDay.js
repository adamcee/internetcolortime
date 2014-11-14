/************************************************************************************************* 
 * displayColorOfTheDay.js
 * THIS FILE MUST BE IN public/javascripts
 * Generate rounded shapeangles - 'swatches'
 * Use 'swatches' to represent discrete chunks of time with color
 * A 'SwatchSpace' contains a group of Swatches and information about itself
 * For example, a SwatchSpace of 60 swatches can represent one minute with 15 '4-second' Swatches
 * This files contains classes and functions for creating and rendering SwatchSpaces and Swatches
 *
 * IMPORTANT 8/8/14:
 * This class also currently handles Canvas rendering and 
 * websockets for internetcolortime. All the action happens here
 ************************************************************************************************/
/********************************Main Application*************************/
/**Creating variables and such**
 * ****************************/
/*Set Canvas width and height - eventually these should be derived from CSS container of canvas*/
view.viewSize = [1000,600];

minSpace = new SwatchSpace(500, 200, 5,3,view.center.clone() -{x:0,y:150} );

var minMoving = null; //Placeholder for minSwatch animating to hourSwatch position...

//destination of minSpace
var destination = new Point(minSpace.ssCenterPoint + [0,330]);//NOTE 10/24/14: Is this modifying ssCenterPoint ????
mark = new Path.Circle(destination, 10);
mark.fillColor = 'pink';
mark.strokeColor = 'black';

hourSpace = new SwatchSpace(900, 200, 10, 6, destination); 
console.log('HourSpace has ' + hourSpace.centerPoints.length + ' centerPoints');

for(var i = 0;i < hourSpace.centerPoints.length; i++){
  var cMark = new Path.Circle(hourSpace.centerPoints[i], 5);
  cMark.fillColor = 'black';
}

/*Hold Paper.js groups ('swatches') which are 'in transit' - being animated*/
var itemsInTransit = [];

/*Hacks to draw visual reference points for animation. Remove for production*/
//center of canvas
centerCirc = new Path.Circle(view.center, 20);
centerCirc.strokeColor = 'black';
centerCirc.fillColor = 'pink'

//outline canvas
boundRect = new Path.Rectangle([0,0], view.viewSize);
boundRect.strokeColor = 'black';



/**Paper.js Animation -- Mainly for animating SwatchSpaces**
************************************************************/
var animationSteps = 40;

function onFrame(event){
 
  if(minSpace && minMoving){
    //Iterate thru an array of all 'minutes' currently in transit and animate.
    //for(var i = 0; i < itemsInTransit.length; i++){
     // curItem = itemsInTransit[i];

      
      //Move swatch to new location
      //var swatchDestination = hourSpace.getActiveCenterPoint();
      //var vector = swatchDestination - minMoving.position;
      //minMoving.position += vector / animationSteps;
      var vector = minMoving.dest - minMoving.item.position;
      minMoving.item.position += vector / animationSteps;

      /*DEBUG: This not working b/c we never seem to get to exact point, I think. Maybe b/c of animationSteps? 
       * In any case while there's an error prog is functioning correct so putting issue on back burner*/
      if(vector.length == 0 ){
        console.log("IN THE HOURSPACE!!!!!!");
        minMoving = null; //reset minMoving to null
        //add curItem to hourSpace SwatchSpace and pop from itemsInTransit[]
      }
    //}
    /*
    if(minSpace.isSpaceFull()){ //We will drop this
    }
    */
  }
}




/**Sockets. Triggering actions based on socket messages**
 * *****************************************************/

//CHANGE TO YOUR SETTINGS. Currently set for Heroku deployment
var socket = io.connect(window.location.hostname);

socket.on('test', function(data){
  console.log("websocket test message: ", data);
});

//Display and scroll tweets
//LINE OF JQUERY TO INSERT UL ON ID 'tweet' GOES HERE


//when new colorstamp received draw swatch to represent it.
socket.on('colorstamp', function(colorstamp){
  
  var swatchColor = colorstamp.modeColors[0];//for now ignore ties...

  //When minSpace full add group to arr for animation and reset minSpace.
  if(!minSpace.isSpaceFull()){

    //console.log('Drawing a '+swatchColor + ' swatch...');
    minSpace.drawNextSwatch(swatchColor, createSmallSwatch);

    
  }
  else{
    hourSpace.printStatus('**HourSpace Status**');//debug
    minMoving = {item: minSpace.group.rasterize(), dest: hourSpace.getActiveCenterPoint()};
    minSpace.deleteSwatches();
    minMoving.item.fitBounds(hourSpace.swatchSize);
    hourSpace.addSwatch(minMoving);//TEMPORARY FOR debug
    
    //itemsInTransit.push(tmpItem);//clone swatchspace and convert to image
    view.update();
  }

  view.update();//needed to re-render canvas correctly on draw

  /*** test/debug ***/
  //iterate thru colorswatch obj. a lot of console messages. Note client receives LOTS more data than we currently use...
  //console.log('Received colorstamp! start: '+colorstamp.start+ ' end: '+colorstamp.end);
  colorstamp.modeColors.forEach(function(color){console.log("Top color is: ",color)});
  //console.log('minSpace.Swatchfull is: ' + minSpace.isSpaceFull());

  var allColors = colorstamp.allColors;
  var colorKeys = Object.keys(allColors);

});//close socket.on('colorstamp'



/*************************************************************************************************************************
 * Function: SwatchSpace
 * 
 * Constructor Function Arguments:
 *   pixelWidth -- width of SwatchSpace in pixels
 *   pixeHeight -- height of SwatchSpace in pixels
 *   xSpace -- Number of columns (x coordinates) SwatchSpace is divided into
 *   ySpace -- Number of rows (y coordinates) SwatchSpace is divided into
 *
 * Returns: SwatchSpace object
 *
 * This function essentially defines the SwatchSpace class. Used to create SwatchSpace object.
 * SwatchSpace is the primary tool for creating and handling Swatches and interacting with the canvas in internetcolortime
 ************************************************************************************************************************/
function SwatchSpace(pixelWidth, pixelHeight, xSpace, ySpace, ssCenterPoint){

  var ss = { /*SwatchSpace Object*/

    /****Variables*****/
    group: new Group(),//Paper.js group for manipulating entire SwatchSpace easily
    width: pixelWidth, height: pixelHeight, xSpace: xSpace, ySpace: ySpace, maxSwatches: xSpace*ySpace, ssCenterPoint: null, 

    //Will be replaced w/paper.js Size obj on init
    swatchSize: null, firstPoint: null,

    swatches: [], centerPoints:  [],

    //pointers track most recently crated swatches. Implementation wraps them around to reset to 0 after they hit maxSwatches
    activeSwatch_pointer: 0, cp_pointer: 0,
    activeSwatch: null, //hold Paper obj of most recently created or 'active' swatch.     

    /****Functions*****/
    
    //Clear the SwatchSpace of all its swatches. Centerpoints, etc, maintained.
    deleteSwatches: function(){
      this.swatches = [];
      this.activeSwatch = null;
      this.activeSwatch_pointer = 0, this.cp_pointer = 0;
      this.group.remove(), this.group = new Group();//Needed for Paper.js to remove old rendering and then to render new swatches
      console.log('Ran deleteSwatches: swatches[] len is ' + this.swatches.length + ' , acSwatch and cp pointers are ' + this.activeSwatch_pointer + ' and ' + this.cp_pointer);
    },

    setSwatchSize: function(){ //Also sets maxSwatches val
                     this.swatchSize = new Size(this.width/this.xSpace, this.height/this.ySpace);
    },

    //Must be run after setSwatchSize. SwatchSpace uses 'top left' coordinate as start point for drawing swatches
    setTopLeftPoint: function(ssCenterPoint){
                      this.ssCenterPoint = ssCenterPoint;
                      this.firstPoint = new Point(
                                              ssCenterPoint - (new Point(this.width, this.height)/2) + (this.swatchSize/2)//Paper.js does the math operations for Points
                                            );
                     },

    setMaxSwatches: function(){
                     this.maxSwatches = this.xSpace*this.ySpace;
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

    //Initialization function.Must be run before using a SwatchSpace
    init: function(){
            this.setSwatchSize();//Must run before setTopLeftPoint()
            this.setTopLeftPoint(ssCenterPoint);
            this.generateCenterPoints();
          },

    incrementAllPointers: function(){
        this.cp_pointer += 1 % this.maxSwatches;
        this.activeSwatch_pointer += 1 % this.maxSwatches;
        //console.log('Running increment all swatch pointers');
        //console.log('Ran incrementASwatchPointer. ActiveSwatch_pointer is: ' + this.activeSwatch_pointer + ' and cp_pointer is: ' + this.cp_pointer);
    },

    //Adds a swatch to the SwatchSpace. Updates pointers. Returns the swatch unchanged.
    addSwatch: function(swatch /*Paper.js Group or Item*/){
       this.swatches[this.activeSwatch_pointer] = swatch;
       this.incrementAllPointers();
       this.group.addChild(swatch);//Add swatch to Paper.js group
       return swatch; 
     },

    getActiveCenterPoint: function(){
       return this.centerPoints[this.cp_pointer];
    },

    isSpaceFull: function(){
       return this.swatches.length == this.maxSwatches ? true : false;
     },

    //Applies a swatch-rendering function of choice to draw Swatch at a given point
    //NOTE: renderFunc arg must return a Paper.js Object (should be a Swatch). renderFunc does the actual rendering on screen.
    drawSwatch:  function(centerPoint, size, color, renderFunc){
      //console.log('in drawSwatch() -- centerPoint: ' + centerPoint); 
      //console.log('Active centerpoint: ' + this.getActiveCenterPoint());
       return this.addSwatch(renderFunc(centerPoint, size, color)); 
    },

    //Draw swatch @ centerpoint[cp_pointer] - used to fill swatchspaces in an order..
    //Checks pointer position and will not draw once array size is reached
    drawNextSwatch:  function(color, renderFunc){
      if(!this.isSpaceFull()){ 
        //Render swatch and add to Group
        var renderedSwatch = this.drawSwatch(this.centerPoints[this.cp_pointer],this.swatchSize,color,renderFunc);
        //console.log('drawing gridPos ',this.cp_pointer);
      }
      else{
        console.log('Swatch is Full according to drawNextSwatch');
      }
    },

    //debug func
    printStatus: function(msg){
      console.log(msg);
      console.log('SwatchSize: ' + this.swatchSize + ', swatches arr length: ' + this.swatches.length + ', pointer at: ' + this.activeSwatch_pointer);
      console.log('Centerpoints arr pointer: ' + this.cp_pointer + ', active centerpoint is: ' + this.getActiveCenterPoint());
   }

  }//close SwatchSpace obj 

  //Do the pseudo-classical constructor-type stuff....
  ss.init();

  return ss;
}//end SwatchSpace func



/* Function: createSwatch
 *
 * Create a color swatch. 
 * Args: center point of swatch (Paper.js Point obj), size (Paper.js Size obj), color (can be Paper.js color)
 * Returns: Paper.js Group which can be used to manipulate the swatch
 */
function createSwatch(centerPoint, theSize, color){

    //console.log('running createswatch2');
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

/* Function: CreateSmallSwatch
 *
 * Another swatch creation function - renders better for smaller sizes
 * 8/8/14 -- args and return same as createSwatch()
 */
function createSmallSwatch(centerPoint, theSize, color){

    var borderColor = 'white';//color of the swatch border

    //Create outer shape
    var shape = new Rectangle([0, 0], theSize);
    shape.strokeColor = 'black';
    shape.strokeWidth = 2;
    var cornerSize = new Size(10,10);
    var path = new Path.Rectangle(shape, cornerSize);

    //Create inner shape to get a nice swatch with a double stroke. Inner shape proportionate to outer shape
    var innerShape = shape.clone();
    var shapeOffSet = 6;
    innerShape.width -= shapeOffSet;
    innerShape.height -= shapeOffSet; 
    var innerCornerSize = 9;//this val determined by trial&error
    innerShape.center = shape.center;
    var innerShapePath = new Path.Rectangle(innerShape, innerCornerSize);
    innerShapePath.strokeColor = borderColor;
    innerShapePath.strokeWidth = 4;//strokeWidth also determined by trial&error

    //Create a group for our Swatch and apply position & color
    mySwatch = new Group([path, innerShapePath]);
    mySwatch.position = centerPoint;
    mySwatch.fillColor = color;

    //console.log ('...' + color + ' swatch rendered');
    //Return the Group so it can be used
    return mySwatch;
}


