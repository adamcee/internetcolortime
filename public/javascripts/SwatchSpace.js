
/* SwatchSpace.js ***************************************************************************************************
 *
 * SwatchSpace class. Used to generate colored 'swatches' over a canvas
 * Uses Paper.js library
 *
 * Adam Cahan
 * July 2014
 *
 *
 *
 * *******************************************************************************************************************/

/* Function - newSwatchSpace
 * Class-constructor-type-function-thingy
 * Returns a SwatchSpace Object
 * Args:
 * pixelWidth (int) - width in pixels of our SwatchSpace. Use view.bounds to get canvas size and use that for pixelWidth and pixelHeight - that is ideal
 * pixelHeight (int) - same as pixelWidth, but for height
 * xSpace (int) - number of swatches along x-axis, number of x-positions in our coordinate space
 * ySpace (int) - same as xSpace but for y/vertical. xSpace*ySpace = total # of swatches allowed in space. This gives us a coordinate plane of sorts
 */
function newSwatchSpace(pixelWidth, pixelHeight, xSpace, ySpace){

  /**SwatchSpace Obj we return**/
  var ss = {
    /**Variables**/

    width: pixelWidth,
    height: pixelHeight,
    xSpace: xSpace,
    ySpace: ySpace,
    swatchSize: null,//Will be replaced w/paper.js Size obj on init. Is Size of Swatch
    firstPoint: null,//will be replaced w/paper.js Point obj on init. Is Point @ center of first Swatch in order

    /**more vars...arrs to store stuff**/
  
    paperLayers: [], //If we use more than one Paper.js layer in swatchspace store here
    swatches: [],   //If we want to store swatch objects created in an array do so here
    centerPoints:  [], //Used to store Point @ center of each grid coordinate. Array should be ordered in to draw Swatches in desired order
    pointer_cp: 0,//pointer for centerPoints arr to track most recently created swatch
    
    /**Functions**/

    //Run on construction. Must be run. Sets Swatch size
    //-- NOTE: I NEED TO GET THIS FUNC AND THE GENEREATECENTERPOINTS WORKING RIGHT....
    setSwatchSize: function(){
                     this.swatchSize = new Size(this.width/this.xSpace, this.height/this.ySpace);
    },

    //Must be run after setSwatchSize. Sets firstPoint. Must be run. Run on construction
    setFirstPoint: function(){
                       this.firstPoint = new Point(view.center.x/(this.xSpace),view.center.y/(this.ySpace));
                     },

    //Simple test func. Edit as needed
    testSwatchSize: function(){//test func
                      console.log('testing swatch size...');
                      var x = this.width/this.xSpace;
                      console.log('x is ',x);
                          y = this.height/this.ySpace;
                      this.swatchSize = x ;
                    },
  
    //Generate center point for each swatch grid point. Must be run on construction LAST, after other init functions
    generateCenterPoints:  function(){
      var daPoint = this.firstPoint.clone();//counter for points, sort of..

      //Loop thru all grid points and generate center points
      for(var y = 0; y < this.ySpace;y++){
        for(var x = 0; x < this.xSpace;x++){
          this.centerPoints.push(daPoint.clone());//copies Point adds to arr
          daPoint.x += this.swatchSize.width;//Increments x pos of our 'point counter' for next grid point
        }
        daPoint.y += this.swatchSize.height;//same as above, but for y
        daPoint.x = this.firstPoint.x;//reset for the next round of looping...
      }
    },

    //Applies a swatch-rendering function of choice to draw Swatch at a given point
    //renderFunc is a callback to allow for different kinds of Swatches to be easily rendered
    //Args: centerPoint - Paper.js Point obj, size - Paper.js size obj, color - color in hex or Paper.js Color, renderFunc - function
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
        return true;
      }
      else{
        return false;
      }
    }

  }//close ss obj 

  /**Do the pseudo-classical constructor-type stuff....**/

  ss.setSwatchSize();
  ss.setFirstPoint();
  ss.generateCenterPoints();

  return ss;
}//end newSwatchSpace func



/*
 * Create a Large rectangular color swatch. 
 * Params: center point of swatch (Paper.js Point obj), size (Paper.js Size obj), color (can be Paper.js color)
 * Returns: Paper.js Group which can be used to manipulate the swatch
 */
function createBigSwatch(centerPoint, theSize, color){

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

/*
 * Create a small rectangular color swatch
 * Same params as createBigSwatch and same obj returned
 * Note that values have been tweaked here to make smaller swatch render better
 * Note that both this and createBigSwatch can definitely be done better
 */
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
