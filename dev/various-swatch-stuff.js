/*
 * Animate drawing a rectangular 'color swatch' every few seconds
 */

//Timer object to help with animation...
var Animator = Animator || {};

  
while(!cools.swatchFull){
  setTimeout(cools.drawNextSwatch('green', funcpass),500000);
}

//Resize function - supposed to redraw canvas and its contents on resize to make responsive
//BROKEN
function onResize(event){
  //path.position = view.center;


  //view info for debug
  console.log('viewsize - '+view.viewSize);
  console.log('view bounds - ' +view.bounds);
  console.log('view center  - ' + view.center);
}

