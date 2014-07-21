
/*
 * Generate rounded shapeangles - 'swatches' - for Color of the Day
 * Combine them into some sort of group - 'palettes' - so a gradient between the different colors can be constructed
 */

/*Set Canvas width and height - eventually these should be derived from CSS container of canvas*/
var canWidth = 1000;
var canHeight = 500;
view.viewSize.width = canWidth;
view.viewSize.height = canHeight;

//Properties of the coordinate space we are displaying our swatches in

//Constructor function
function SwatchSpace(width, height, colorsArr){
  this.width = width;
  this.height = height;
  this.swatchColors = colorsArr;
}

//Object
SwatchSpace.prototype = {

/* Functions go here....specifically functions to calculate correct positioning/sizing of swatches based on SwatchSpace size, padding, and total # of swatches in space (det. by color array) */
}

var swatchSpace = new SwatchSpace(canWidth-50, canHeight-100, ['red','yellow','green','blue']);

var numSwatches = swatchSpace.swatchColors.length, i = 0;
//var swatches = [];

while(++i < numSwatches){
  /**Fill this with the code to iterate through the swatchSpace color array and create a swatch for each color -swatch should be appropriate size!**/  
 // createSwatch(thePoint, theSize, swatchSpace.theColors[i]);
  
}



sPoint = new Point(view.center.x/2,view.center.y);
var theSwatch = createSwatch(sPoint,[swatchSpace.width/2, swatchSpace.height],'blue'); 

var otherSwatch = createSwatch(new Point(view.center.x*1.5, view.center.y), [swatchSpace.width/2,swatchSpace.height],'green');

/*
 * Create a color swatch. 
 * Params: center point of swatch (Paper.js Point obj), size (Paper.js Size obj), color (can be Paper.js color)
 * Returns: Paper.js Group which can be used to manipulate the swatch
 */
function createSwatch(centerPoint, theSize, color){

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


//Redraw the canvas and everything in it to new size on page resize
function onResize(event){
  //path.position = view.center;


  //view info for debug
  console.log('viewsize - '+view.viewSize);
  console.log('view bounds - ' +view.bounds);
  console.log('view center  - ' + view.center);
}
