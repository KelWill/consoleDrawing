$(document).ready(function () {
    //Set up some globals
    var pixSize = 8, lastPoint = null, currentColor = "000", mouseDown = 0;

    var pixelDataRef = [];
    for (var i = 0; i < 60; i++){
      var inner = [];
      for (var j = 0; j < 60; j++){
        inner.push(0);
      }
      pixelDataRef.push(inner);
    }

    // Set up our canvas
    var myCanvas = document.getElementById('drawing-canvas');
    var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
      alert("You must use a browser that supports HTML5 Canvas for this to work");
      return;
    }

    //Setup each color palette & add it to the screen
    // var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
    var colors = ['fff', '000'];
    for (c in colors) {
      var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
      item.click((function () {
        var col = colors[c];
        return function () {
          currentColor = col;
        };
      })());
      item.appendTo('#colorholder');
    }

    //Keep track of if the mouse is up or down
    myCanvas.onmousedown = function () {mouseDown = 1;};
    myCanvas.onmouseout = myCanvas.onmouseup = function () {
      mouseDown = 0; lastPoint = null;
    };

    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
      if (!mouseDown) return;

      e.preventDefault();

      // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
      var offset = $('canvas').offset();
      var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
        y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Firebase, or if we are drawing white, remove the pixel
        
        // pixelDataRef.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);
        pixelDataRef[y0][x0] = (currentColor ==="fff" ? 0 : 1);
        if (currentColor === '000'){
          drawPixel(x0, y0);
        } else {
         clearPixel(x0, y0);
        }

        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
      lastPoint = [x1, y1];
    };
    $(myCanvas).mousemove(drawLineOnMouseMove);
    $(myCanvas).mousedown(drawLineOnMouseMove);

    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(x, y) {
      myContext.fillStyle = "#000";
      
      // var coords = snapshot.name().split(":");
      // myContext.fillStyle = "#" + snapshot.val();
      myContext.fillRect(parseInt(x) * pixSize, parseInt(y) * pixSize, pixSize, pixSize);
    };
    var clearPixel = function(x, y) {
      // var coords = snapshot.name().split(":");
      myContext.clearRect(parseInt(x) * pixSize, parseInt(y) * pixSize, pixSize, pixSize);
    };

    $('#change').on('click', function(){
     console.log(pixelDataRef);
      var results= turnIntoConsoleLog(pixelDataRef);
      for (var i = 0; i < results.length; i++){
        console.log('%c' + results[i], 'font-family: Courier');
      }
    });

    var turnIntoConsoleLog = function(imgArray){
      var results = [];
      for (var i = 0; i < imgArray.length; i+=2){
        var line = '';
        for (var j = 0; j < imgArray[i].length; j+=2){
          var array = [[imgArray[i][j], imgArray[i+1][j]], [imgArray[i+1][j], imgArray[i+1][j+1]] ];
          line+=turnArrayIntoText(array);
        }
        results.push(line);
      }
      return results;
    };

    turnArrayIntoText = function(array){
      return pictures[array.toString()];
    };

    var pictures = {
      '1,0,0,0': '\'',
      '0,1,0,0': '\'',
      '1,1,0,0': '^',
      '1,1,1,0': 'P',
      '1,1,1,1': 'X',
      '0,1,0,0': '^',
      '0,1,1,0': '|',
      '0,1,1,1': 'd',
      '0,0,1,0': '.',
      '0,0,1,1': '_',
      '0,0,0,1': '.',
      '1,0,0,1': '\\',
      '0,1,0,1': '/',
      '1,1,0,1': 'b',
      '1,1,0,1': '7',
      '0,0,0,0' : ' '
    };
  });