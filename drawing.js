var pos = {x: 0, y: 0};

var tool = 'pencil';
var color="#149AB4";
var radius = 3;
var opacity = 1;

var mouseLayer = $("#mouse").get(0);
var mouseContext = mouseLayer.getContext("2d");
var mouseDown = false;

var layers = [$("#layer1").get(0), $("#layer0").get(0)];
var currentLayer = 1;
var nextLayerId = 2;
var currentContext = layers[currentLayer].getContext("2d");

var stroke = [];
var strokeLayer = $("#stroke").get(0);
var strokeContext = strokeLayer.getContext("2d");

var changes = [];
var currentChange;

var cursorInWindow = true;

var toolbox = new AppWindow( 5, 2, 'Toolbox');
var colorwindow = new AppWindow( 2, 1, 'Colors');
var layerwindow = new AppWindow( 1, 4, 'Layers');
var aboutwindow = new AppWindow( 1, 1, 'About');
var helpwindow = new AppWindow(1, 1, 'Help');

function init() {
    prepareCanvas(mouseLayer);
    for(var i = 0; i < layers.length; i++) {
	    prepareCanvas( layers[i]);
    }
    prepareCanvas($("#background").get(0));
    prepareCanvas(strokeLayer);

    mouseContext.lineWidth = 1;
    mouseContext.strokeStyle = 'black';
    
    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange=0;

    toolbox.addItem( 0, 0, "<img src='img/pencil.png' class='selectedTool' />", "toolbox-pencil", function() {
        $(".selectedTool").removeClass('selectedTool');
        $("#toolbox-pencil").addClass('selectedTool');
        tool = 'pencil';
    });

    toolbox.addItem( 0, 1, "<img src='img/eraser.png' />", "toolbox-eraser", function() {
        $(".selectedTool").removeClass('selectedTool');
        $("#toolbox-eraser").addClass('selectedTool');
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

    toolbox.addItem( 4, 0, "<img src='img/info.png'>", "toolbox-info", function() {
            aboutwindow.toggle();
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
 
    colorwindow.addItem(0, 0, "<input type='color' id='color-select'></input>", "color-main", function() {});

    aboutwindow.addItem(0, 0,
        '<div style="max-width: 500px">' +
        '<img style="float:left; width:250px; height:250px;" src="img/doodle.png"/>' +
        '<p>Hello! This project is still in development, but thank you for using it!</p>'+
        '<p>If you have comments or suggestions, feel free to email me at mcintire.evan@gmail.com, Id love to hear from you!</p>' +
        '<p> If you want, you can try out the beta <a href="http://draw.evanmcintire.com/beta/drawingapp/"> here</a>.</p>' +
        '<p style="clear: both"> You can also look at the source code <a href="https://github.com/McIntireEvan/drawingapp"> here</a>. This program is provided under the GNU GPL v2</p>' +
        '<h3>Credits</h3>' +
        '<ul>' +
        '<li> Programming: Evan McIntire (mcintire.evan@gmail.com)</li>' +
        '<li> Graphics: Andy Hoang (powergrip776@gmail.com)</li>' +
        '</ul>' +
        '</div', 'about-main', function() {});

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
 
        if(cursorInWindow) {
            drawCursor(mouseLayer, mouseContext, pos, color, radius);  
        }
        currentContext.lineWidth = radius * 2;
	    strokeContext.lineWidth = radius * 2;
        $("#opacity").text = opacity;
    });

    $(document).on('mousedown', '#ToolboxWindow .AppWindowItem', function() {
        $(this).addClass('selectedTool');
    });
    
    $(document).mouseup(function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-' + tool).addClass('selectedTool');
    });

    //TODO: Clean up the event attaching
    var mouseup = function(evt) {
        if(evt.which == 1) {
            if(mouseDown) {
                pos = getMousePos(mouseLayer, evt);
	            stroke.push(pos);
	            clearCanvas(strokeLayer);
	            mouseDown = false;
	            drawStrokeToCanvas(layers[currentLayer]);
	            currentChange++;

                if(currentChange != changes.length) {
	                changes.splice(currentChange, changes.length  - currentChange);
	            }
 
	            changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
	            stroke=[];
                clearCanvas(mouseLayer);
            }
	    }
    };

    mouseLayer.addEventListener('mouseup', mouseup);
    document.addEventListener('mouseout', mouseup, false)

    mouseLayer.addEventListener('mousemove', function(evt) {
	    previousPos = pos;
        pos = getMousePos(mouseLayer, evt);
	    if(cursorInWindow) {
            drawCursor(mouseLayer, mouseContext, pos, color, radius);
        }
        if(mouseDown) {
	        if(tool == "eraser" || tool == "pencil") {
		        stroke.push(pos);
		        clearCanvas(strokeLayer);
		        drawStrokeToCanvas(strokeLayer);
	        }
	    }
    }, false);


    mouseLayer.addEventListener('mousedown', function(evt) {
	    if(evt.which == 1) {
	        stroke.push(pos);
            pos = getMousePos(mouseLayer, evt);
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
    
    $(document).on('mouseleave', function() {
        cursorInWindow = false;
        clearCanvas( mouseLayer );
    });
    
    $(document).on('mouseenter', function() {
        cursorInWindow = true;
        clearCanvas( mouseLayer );
    });
    
    $(window).on('resize',function() {
        prepareCanvas( mouseLayer );
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

    $(document).bind("contextmenu", function(event) {       
        event.preventDefault();              
    });
}

function undo() { 
    if(currentChange > 0) {
	    currentChange--;
        doLayerRedraw();
    } else {
        for(var i=0; i<layers.length; i++) {
            clearCanvas(layers[i]);
        }
        clearCanvas($("#background").get(0)); 
    }
}

function redo() {
    if(currentChange < changes.length - 1) {
	    currentChange++;
        doLayerRedraw();
	}
}

//TODO: Give this a better name
function doLayerRedraw() {
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

    toolbox.appendToBody(false, 0, 0);
    //TODO: Center this
    aboutwindow.appendToBody(true, 100, 100);
    colorwindow.appendToBody(true, 100, 0);
    //$('body').append(layerwindow.toHTML());
});
