var color="#149AB4";
var backgroundColor = "#ffffff";
var radius = 10;
var pos = {x: 0, y: 0};
var Jcanvas = $("#mouse");
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

var dragging = {layers: false, brush: false};
var isOpen = {layers: true, brush:false};
var pos = {mouse: {x: 0,y: 0}, layers: {x: 100, y: 0}, brush: {x: 200,  y: 100}};

var toolbox = templates.window;
var layersStart = "<table class='window' id='layers'>" 
		+ "<tr><td id='layersTitle' colspan='3' class='windowTitle'> Layers </td><td id='layersExit'>X</td></tr>"
		+ "<tr id='layer-control'><td class='tool'><img src='img/layerAdd.png' id='addLayer'/></td><td class='tool'><img src='img/layerRemove.png' id='removeLayer'></td>"
		+ "<td class='tool'><img src='img/save.png' id='saveLayer'/></td><td class='tool'><img src='img/clear.png' id='clearLayer'/></td></tr>";
var layersEnd =  "</table>";

var brushHTML = "<table class='window' id='brushes'>"
	      + "<tr><td class='windowTitle' id='brushesTitle'> Brush  </td><td id='brushesExit'> X </td></tr>"
	      + "<tr><td><input label='Brushsize' type='range'/></td><td></td></tr>"
	      + "<tr><td></td></tr></table>";


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
	previousPos = pos.mouse;
	if(evt.type == "mousemove") {
            pos.mouse = getMousePos(canvas, evt);
        }
	drawCursor(canvas, context, pos.mouse, color, radius);
        if(mouseDown) {
	    if(tool == "eraser" || tool == "pencil") {
		stroke.push(pos.mouse);
		clearCanvas(strokeLayer);
		drawStrokeToCanvas(strokeLayer);
	    }
	}

    };
    canvas.addEventListener('mousemove', mousemove, false);

    var mouseup = function(evt) {
	if(evt.which == 1) {
            pos.mouse = getMousePos(canvas, evt);
	    stroke.push(pos.mouse);
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
	    stroke.push(pos.mouse);
	    pos.mouse = getMousePos(canvas, evt);
	    if(tool == "pencil") {
                strokeContext.globalCompositeOperation="source-over";
	    } else if (tool == "eraser") {
	        strokeContext.globalCompositeOperation="destination-out";		
        }
	    stroke.push(pos.mouse);
	    drawStrokeToCanvas(strokeLayer);
            mouseDown = true;
	}
    };

    canvas.addEventListener('mousedown', mousedown, false); 

    $(document).keydown(function(e) {
        if(e.which == 187) {
	        if(e.shiftKey) {
		        if(opacity < 1.0)
                   opacity += 0.01;
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
	} else if(e.which == 49 && e.ctrlKey) {
	    e.preventDefault();
	    if(!$("#toolbox").length) {
	        displayToolbox();
	    } else {
		$("#toolbox").remove();
	    	toolbox.isOpen = false;
	    }
	} 
        drawCursor(canvas, context, pos.mouse, color, radius);  
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
        if(!toolbox.isOpen) {
	    toolbox.open();	   
	}
    });
   contextMenu.addEvent("layersOpen", "Layers", function() {
        if(!isOpen.layers) {
	    displayLayerSelecter();	    
	}
    });
    
    contextMenu.addEvent("todo", "<a href='https://trello.com/b/KzbX8TxT/drawing-thing' target='_blank'> Todo List </a>", function(){});
    contextMenu.addEvent("bugs", "<a href='http://goo.gl/forms/gUKiIIhPSm' target='_blank'>Bug Reports</a>", function(){});
    contextMenu.load();

toolbox.id = "toolbox";
toolbox.header = "<tr><td class='windowTitle' id='toolboxTitle'> Tools </td><td title='Close' id='toolboxExit'>X</td></tr>";
toolbox.beginRow();
toolbox.addElement("pencil", "selected tool",1, "<img title='Pencil' src='img/pencil.png'/>",function() {
    $(".selected").removeClass('selected');
    $("#pencil").addClass('selected');
    tool = 'pencil';
});
toolbox.addElement("eraser","tool",1,"<img title='Eraser' src='img/eraser.png'/>", function() {
    $(".selected").removeClass('selected');
    $("#eraser").addClass('selected');
    tool = 'eraser';
});
toolbox.endRow();
toolbox.beginRow();
toolbox.addElement("cpholder","",2,"<input value='" + color + "' id='colorpicker' type='color' />", function() {});
toolbox.endRow();
toolbox.beginRow();
toolbox.addElement("toolbox-clear","tool",1,"<img src='img/clear.png'/>", function(){
    if(confirm('Clear all layers?')) {
        for(var i=0; i<layers.length; i++) {
	    clearCanvas(layers[i]);
        }
	clearCanvas($("#background").get(0)); 
    }
});
toolbox.addElement("toolbox-save","tool",1,"<img src='img/save.png'/>", function(){
    var c = mergeLayers($("#background").get(0), layers);
    saveToImage(c);
    clearCanvas($("#background").get(0));
});
toolbox.endRow();
toolbox.beginRow();
toolbox.addElement("toolbox-undo","tool",1,"<img src='img/undo.png'/>", function(){ undo(); });
toolbox.addElement("toolbox-redo","tool",1,"<img src='img/redo.png'/>", function(){ redo(); });
toolbox.endRow();

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

    $(document).on('mousedown', function(evt) {
	    if ($(evt.target).attr("id") == "layersTitle") {
		evt.preventDefault();
		dragging.layers = true;
	    }
	});

    $(document).on('mouseup', function(evt) {
	toolbox.dragging = false;
	dragging.layers = false;
    });

    $(document).on('mousemove', function(evt) {
         document.getSelection().removeAllRanges();

	 if(toolbox.dragging) {
	    if((evt.pageY > 0) && ((evt.pageY + $("#toolbox").height()) < canvas.height) && (evt.pageX > 0) && (evt.pageX + $("#toolbox").width() < canvas.width)) {
	        $("#toolbox").css({left: evt.pageX + "px"});
	        $("#toolbox").css({top:  evt.pageY + "px"});
   	        toolbox.pos.x = evt.pageX;
	        toolbox.pos.y = evt.pageY;
	    }
	} else if(dragging.layers) {
	    if((evt.pageY > 0) && ((evt.pageY + $("#layers").height()) < canvas.height) && (evt.pageX > 0) && (evt.pageX + $("#layers").width() < canvas.width)) {
	        $("#layers").css({left: evt.pageX + "px"});
	        $("#layers").css({top:  evt.pageY + "px"});
   	        pos.layers.x = evt.pageX;
	        pos.layers.y = evt.pageY;
	    }
	}
    });

    $(document).on('input', '#colorpicker', function() {
        color = $("#colorpicker").val();
	$("div.right-click").hide(100);
    });
}

toolbox.open = function() {
    $(toolbox.html).appendTo("body").css({top: toolbox.pos.y+"px", left: toolbox.pos.x+"px"});
    $("div.right-click").hide(100);
    $("#colorpicker").val(color);
    toolbox.isOpen = true;
    $(".selected").removeClass("selected");
    $("#" + tool).addClass("selected");
    _self = this;
    $(document).on('mousedown', function(evt) {
        if(!($(evt.target).is("canvas"))) {
            if(typeof evt.preventDeault == 'function') {
		evt.preventDefault();
	    }
	}
	if($(evt.target).parent().attr("id") == _self.headerID) {
	    _self.dragging = true;
	}
    });
};

function displayLayerSelecter() {
    var layersHTML = layersStart;
    for(var i = 0; i<layers.length; i++) {
	layersHTML += "<tr class='layerSelectRow' id='" + layers[i].id  + "Control'><td colspan='3'>" + layers[i].id + "</td><td class='temp'><img class='layerVisible' src='img/visible.png'/></td></tr>";
    }
    $(layersHTML + layersEnd).appendTo("body").css({top: pos.layers.y +"px", left: pos.layers.x+"px"});
    $("div.right-click").hide(100);
    isOpen.layers = true;
    $("#" + layers[currentLayer].id+ "Control").addClass('selectedLayer');
}

function displayBrushSelecter() {
    $(brushHTML).appendTo("body").css({top: pos.brush.y +"px", left: pos.brush.x+"px"});
    $("div.right-click").hide(100);
    isOpen.brush = true;
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
   canvas.width = Jcanvas.css("width").replace("px","");
   canvas.height = Jcanvas.css("height").replace("px","");
}

$(document).ready(function() {
    canvasSetup();
    contextmenuSetup();
    console.log('Loading complete');
    $("#splash").fadeOut(1500);
    
    toolbox.open();
    displayLayerSelecter();
});
