var color="#149AB4";
var backgroundColor = "#ffffff";
var radius = 3;
var pos = {x: 0, y: 0};

var canvas = $("#mouse").get(0);
var context = canvas.getContext("2d");
var mouseDown = false;
var tool = 'pencil';

var layers = [$("#layer1").get(0), $("#layer0").get(0)];
var nextLayerId = 2;

var stroke = [];

var opacity = 1;

var tempCanvas;

var changes = [];
var currentChange = 0;

var strokeLayer = $("#stroke").get(0);
var strokeContext = strokeLayer.getContext("2d");

var currentLayer = 1;
var currentContext = layers[currentLayer].getContext("2d");

var toolbox = new AppWindow( 4, 2, 'Toolbox');
var contextMenu = new CustomContextMenu();
var colorwindow = new AppWindow( 2, 1, 'Colors');
var layerwindow = new AppWindow( 3, 4, 'Layers');

function init() {
    prepareCanvas(canvas);
    for(var i = 0; i < layers.length; i++) {
	    prepareCanvas( layers[i]);
    }
    prepareCanvas($("#background").get(0));
    prepareCanvas(strokeLayer);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    
    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange=1;

    toolbox.addItem( 0, 0, "<img src='img/pencil.png' class='selected' />", "toolbox-pencil", function() {
        $(".selected").removeClass('selected');
        $("#toolbox-pencil").addClass('selected');
        tool = 'pencil';
    });

    toolbox.addItem( 0, 1, "<img src='img/eraser.png' />", "toolbox-eraser", function() {
        $(".selected").removeClass('selected');
        $("#toolbox-eraser").addClass('selected');
        tool = 'eraser';
    });

    toolbox.addItem( 1, 0, "<img src='img/color.png' />", "toolbox-color", function() {
        colorwindow.toggle();
    });

    toolbox.addItem( 1, 1, "<img src='img/brush.png' />", "toolbox-brush", function() {
        alert('Coming soon!');
    });

    toolbox.addItem( 2, 0, "<img src='img/undo.png' />", "toolbox-undo", function() {
        undo();
    });

    toolbox.addItem( 2, 1, "<img src='img/redo.png' />", "toolbox-redo", function() {
        redo();
    });

    toolbox.addItem( 3, 0, "<img src='img/save.png' />", "toolbox-save", function() {
        saveCanvasToImage(mergeCanvases($("#background").get(0), layers));
        clearCanvas($("#background").get(0));
    });

    toolbox.addItem( 3, 1, "<img src='img/clear.png'>", "toolbox-clear", function() {
        if(confirm('Clear all layers?')) {
            for(var i=0; i<layers.length; i++) {
                clearCanvas(layers[i]);
            }
            clearCanvas($("#background").get(0)); 
         }
    });

    layerwindow.addItem( 0, 0, "<img src='img/layerAdd.png' />", "layer-add", function() {
        console.log("ADD LAYER");
    });

    layerwindow.addItem( 0, 1, "<img src='img/layerRemove.png' />", "layer-remove", function() {
        console.log("REMOVE LAYER");
    });

    layerwindow.addItem( 0, 2, "<img src='img/clear.png' />", "layer-clear", function() {
        if( confirm( 'Clear current Layer?' ) ){
            clearCanvas( layers[ currentLayer ] );
        }
    });

    layerwindow.addItem( 0, 3, "<img src='img/save.png' />", "layer-save", function() {
        saveCanvasToImage( layers[ currentLayer ] );
    });

    contextMenu.addItem('<a target="_blank" href="https://www.github.com/McIntireEvan/drawingapp">Code can be found here!</a>', "source-link", function(){});
    contextMenu.addItem('<a target="_blank" href="http://draw.evanmcintire.com/beta/drawingapp">The beta for this can be found here</a>', "beta-link", function(){});
    contextMenu.addItem('[Close]', 'CCM-Close', function() {
        contextMenu.close(); 
    });

    colorwindow.addItem(0, 0, "<div><input type='color' id='color-select'></input></div>", "color-main", function() {});

    addEventListeners();
}

function addEventListeners() {    
    //TODO: Possibly rewrite this to be shorter?
    $(document).keydown(function(e) {
        if(e.which == 187) {
	        if(e.shiftKey) {
		        if(opacity < 1.0) {
                   opacity += 0.01;
                }
	        } else {
	            radius++;
	        }
        } else if(e.which == 189) {
            if(radius>1) { 
		        if(e.shiftKey) {
		            if(opacity > 0) {
		                opacity -= 0.01;
		            }
		        } else {radius--; }
	        }
        } else if(e.which==90 && e.ctrlKey) {
	        undo();
	    } else if(e.which==89 && e.ctrlKey) {
	        redo();
	    } 
	 
        drawCursor(canvas, context, pos, color, radius);  
        currentContext.lineWidth = radius * 2;
	    strokeContext.lineWidth = radius * 2;
        $("#opacity").text = opacity;
    });
    
    var mouseup = function(evt) {
	    if(evt.which == 1) {
            if(mouseDown) {
                pos = getMousePos(canvas, evt);
	            stroke.push(pos);
	            clearCanvas(strokeLayer);
	            mouseDown = false;
	            drawStrokeToCanvas(layers[currentLayer]);
	            if(currentChange != changes.length) {
	                changes.splice(currentChange, changes.length  - currentChange);
	            }
	            currentChange++;

	            changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
	            stroke=[];
            }
	    }
    };

    canvas.addEventListener('mouseup', mouseup, false);
    document.addEventListener('mouseout', mouseup, false)

    canvas.addEventListener('mousemove', function(evt) {
	    previousPos = pos;
        pos = getMousePos(canvas, evt);
	    drawCursor(canvas, context, pos, color, radius);
        if(mouseDown) {
	        if(tool == "eraser" || tool == "pencil") {
		        stroke.push(pos);
		        clearCanvas(strokeLayer);
		        drawStrokeToCanvas(strokeLayer);
	        }
	    }

    }, false);


    canvas.addEventListener('mousedown', function(evt) {
	    if(evt.which == 1) {
	        stroke.push(pos);
            pos = getMousePos(canvas, evt);
	        if(tool == "pencil") {
                strokeContext.globalCompositeOperation="source-over";
	        } else if (tool == "eraser") {
	            strokeContext.globalCompositeOperation="destination-out";		
            }
	        stroke.push(pos);
	        drawStrokeToCanvas(strokeLayer);
            mouseDown = true;
	    }
    }, false); 
    $(window).on('resize',function() {
        prepareCanvas(canvas);
        for(var i = 0; i < layers.length; i++) {
	        merge($('#background').get(0), layers[i] );
            prepareCanvas( layers[i]); 
            layers[i].getContext('2d').drawImage($('#background').get(0), 0, 0);
            clearCanvas($('#background').get(0));
        }
        prepareCanvas($("#background").get(0));
        prepareCanvas(strokeLayer);
    });

    $(document).on('change', '#color-select', function() {
      color = $('#color-select').val()
    });
}

function undo() { 
    console.log(currentChange);
    if(currentChange > 0) {
	    currentChange--;
        var newElement = changes[currentChange];
        var newLayer =  layers[newElement.layer];
        clearCanvas(newLayer);
        var img= new Image();
        img.src = newElement.context;
        newLayer.getContext('2d').globalAlpha = 1;
        newLayer.getContext('2d').drawImage(img,0,0);
        newLayer.getContext('2d').globalAlpha = opacity;
        layers[newElement.layer]=newLayer;
    	if(currentChange === 0) {
	        currentChange = 1;
	    }
    }
}

function redo() {
    if(currentChange < changes.length - 1) {
        console.log(currentChange);
	    currentChange++;

	    var newElement = changes[currentChange];
        var newLayer =  layers[newElement.layer];
        clearCanvas(newLayer);
        var img= new Image();
        img.src = newElement.context;
        newLayer.getContext('2d').globalAlpha = 1;
        newLayer.getContext('2d').drawImage(img,0,0);
        newLayer.getContext('2d').globalAlpha = opacity;
 
        layers[newElement.layer]=newLayer;    
    }
}

function drawStrokeToCanvas(canvas) {
    var c = canvas.getContext('2d');
    if(c.globalAlpha != opacity) { c.globalAlpha = opacity; }
    if(c.lineJoin != 'round') { c.lineJoin = 'round'; }
    if(c.lineWidth != (radius * 2)) { c.lineWidth = radius*2; }
    if(c.strokeStyle != color) { c.strokeStyle = color; }
    if(c.fillStyle != color) { c.fillStyle = color;}
    if(c.globalCompositeOperation != strokeContext.globalCompositeOperation) {
	    c.globalCompositeOperation = strokeContext.globalCompositeOperation;
    }
    c.beginPath();
      
    c.moveTo(stroke[0].x+0.1, stroke[0].y);
    for(var i = 0; i < stroke.length; i++) {
	    c.lineTo(stroke[i].x, stroke[i].y);
        if(i < 2) {
	        c.closePath();
    	}
    } 
    
    c.moveTo(stroke[stroke.length-1].x, stroke[stroke.length-1].y);
    c.lineTo(stroke[stroke.length-1].x, stroke[stroke.length-1].y+0.1);
    c.closePath();
    c.stroke();
}

function drawCursor(canvas, context, pos, color, radius){
    context.clearRect(0,0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    if(tool == "pencil") {
	    context.fillStyle=color;
    } else if (tool == "eraser") {
	    context.fillStyle="rgba(0,0,0,0)";
    }
    context.fill();
    context.stroke();
}

function prepareCanvas(canvas) {
   canvas.width = $('#mouse').css('width').replace('px','');
   canvas.height = $('#mouse').css('height').replace('px','');
}

$(document).ready(function() {
    init();

    console.log('Loading complete');
    $('#splash').fadeOut(1500);

    $('body').append(toolbox.toHTML());
    $('body').append(colorwindow.toHTML());
    colorwindow.toggle();
    //$('body').append(layerwindow.toHTML());
});
