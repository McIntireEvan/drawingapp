var color="#149AB4";
var backgroundColor = "#ffffff";
var radius = 10;
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

var contextMenu = templates.contextMenu;

var strokeLayer = $("#stroke").get(0);
var strokeContext = strokeLayer.getContext("2d");

var currentLayer = 1;
var currentContext = layers[currentLayer].getContext("2d");

var toolbox = new AppWindow(2,2,"Toolbox");

function canvasSetup() {
    prepareCanvas(canvas);
    for(var i = 0; i < layers.length; i++) {
	    prepareCanvas(layers[i]);
    }
    context.lineWidth=1;
    context.strokeStyle="black";

    prepareCanvas($("#background").get(0));
    prepareCanvas(strokeLayer);
    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange=1;
    var mousemove = function(evt) {
	    previousPos = pos;
	    if(evt.type == "mousemove") {
            pos = getMousePos(canvas, evt);
        }
	    drawCursor(canvas, context, pos, color, radius);
        if(mouseDown) {
	        if(tool == "eraser" || tool == "pencil") {
		        stroke.push(pos);
		        clearCanvas(strokeLayer);
		        drawStrokeToCanvas(strokeLayer);
	        }
	    }

    };
    canvas.addEventListener('mousemove', mousemove, false);

    var mouseup = function(evt) {
	    if(evt.which == 1) {
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
    };

    canvas.addEventListener('mouseup', mouseup, false);

    var mousedown = function(evt) {
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
    };

    canvas.addEventListener('mousedown', mousedown, false); 

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

    $(document).mouseout(function(evt) {
	    mouseDown = false;
    });
    $(document).mouseenter(function(evt) {
	    mouseDown = false;
    });
}

function contextmenuSetup() {
    contextMenu.addEvent("close", "<span class='menu' style='width:100%; height:100%;'>Menu|<span class='exit'>  X</span></span>", function() {
        $("div.right-click").hide(100);
    });   
    contextMenu.addEvent("toolboxOpen", "Tools", function() {
          
	
    });
   contextMenu.addEvent("layersOpen", "Layers", function(){});
    
    contextMenu.addEvent("todo", "<a href='https://trello.com/b/KzbX8TxT/drawing-thing' target='_blank'> Todo List </a>", function(){});
    contextMenu.addEvent("bugs", "<a href='http://goo.gl/forms/gUKiIIhPSm' target='_blank'>Bug Reports</a>", function(){});
    contextMenu.load();

    $(document).bind("click", function(event) {
        var target = $(event.target);
	var id = target.attr("id");
	if(id=="layersExit") {
	    $("#layers").remove();
	    isOpen.layers = false;
	} else if(id=="toolboxExit") {
	    $("#toolbox").remove();
	    toolbox.isOpen = false;	        
	} else if(target.hasClass("layerVisible")) {
	    var pId = $(target.parent().parent()).attr("id").replace("Control","");
	    $("#"+pId).toggle();
	    
	    if($(target).attr("src") == "img/visible.png") {
	    	$(target).attr('src',"img/hidden.png");
	    } else {
		$(target).attr('src',"img/visible.png");
	    }
	}  else if(target.parent().attr("class") == "layerSelectRow") {    
	    $(".selectedLayer").removeClass("selectedLayer");
	    target.parent().addClass("selectedLayer");
	    currentLayer = layers.indexOf($("#" + (target.parent().attr("id").replace('Control', ''))).get(0));
	    currentContext = layers[currentLayer].getContext('2d');
	    $(strokeLayer).css("z-index",currentLayer+2);
	    
	} else if(id=="addLayer") {
	    addLayer();	    
	} else if(id=="removeLayer") {
	    if(layers.length > 1) {
		var layerId = layers[currentLayer].id.replace("Control","");
		if(confirm('Remove Layer ' + layerId + "?")) {
		    layers.splice(currentLayer, 1);
		    currentLayer = Math.max(0, currentLayer-1);
		    currentContext = layers[currentLayer].getContext('2d');
		    $("#"+layerId).remove();
		    $("#layers").remove();
	            displayLayerSelecter();
	        }
	    }
	}  else if(id=="saveLayer") {
	    saveToImage(layers[currentLayer]);
	    clearCanvas($("#background").get(0));
	} else if(id=="clearLayer") {
	    clearCanvas(layers[currentLayer]);
	}	
    });
 
    $(document).on('input', '#colorpicker', function() {
        color = $("#colorpicker").val();
	    $("div.right-click").hide(100);
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

function addLayer() {
    var layerId = "layer" + nextLayerId;
    $("<canvas id='" + layerId  + "'></canvas>").appendTo("body").css({"z-index": nextLayerId});
    prepareCanvas($("#"+layerId).get(0));
    layers.unshift($("#"+layerId).get(0));
    currentContext = layers[currentLayer].getContext('2d');
    nextLayerId++;
    $("#layers").remove();
    displayLayerSelecter();
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
   canvas.width = $('#mouse').css("width").replace("px","");
   canvas.height = $('#mouse').css("height").replace("px","");
}

$(document).ready(function() {
    //TODO: Move these somewhere else
    toolbox.addItem( 0, 0, "<img src='img/pencil.png'>", "toolbox-pencil", function() {
        $(".selected").removeClass('selected');
        $("#toolbox-pencil").addClass('selected');
        tool = 'pencil';
    });

    toolbox.addItem( 0, 1, "<img src='img/eraser.png'>", "toolbox-eraser", function() {
        $(".selected").removeClass('selected');
        $("#toolbox-eraser").addClass('selected');
        tool = 'eraser';
    });

    toolbox.addItem( 1, 0, "<img src='img/save.png'>", "toolbox-save", function() {
        saveCanvasToImage(mergeCanvases($("#background").get(0), layers));
        clearCanvas($("#background").get(0));
    });

    toolbox.addItem( 1, 1, "<img src='img/clear.png'>", "toolbox-clear", function() {
        if(confirm('Clear all layers?')) {
            for(var i=0; i<layers.length; i++) {
                clearCanvas(layers[i]);
            }
            clearCanvas($("#background").get(0)); 
         }
    });

    canvasSetup();
    contextmenuSetup();
    console.log('Loading complete');
    $('#splash').fadeOut(1500);

    $('body').append(toolbox.toHTML());
});
