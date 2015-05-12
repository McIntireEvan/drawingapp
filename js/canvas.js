var pos = {x: 0, y: 0};
var lastPos = pos;

var color = '#81CD29';
var color1 = color;
var color2 = '#FFFFFF';

var mouseLayer = $('#mouse').get(0);
var mouseContext = mouseLayer.getContext('2d');
var mouseDown = false;

var layers = [$('#layer0').get(0), $('#layer1').get(0)];
var currentLayer = 0;
var nextLayer = 2;

var stroke;
var strokeLayer = $('#stroke').get(0);
var strokeContext = strokeLayer.getContext('2d');

var pencil = {
    'type': 'pencil',
    'radius': 3,
    'opacity': 1,
    'color': color,
    'globalCompositeOperation': 'source-over'
};
 
var eraser = {
    'type': 'eraser',
    'radius': 3,
    'opacity': 1,
    'color': 'rgba(255,255,255,1)',
    'globalCompositeOperation': 'destination-out'
};

var text = {
    'type': 'text',
    'font': '32px serif',
    'color': color
};

var eyedropper = {
    'type': 'eyedropper'
};

//TODO: rename to tool
var currTool = pencil;

function setContextValues(canvas, tool) {
    var c = canvas.getContext('2d');
    if (c.globalAlpha != tool.opacity) { c.globalAlpha = tool.opacity; }
    if (c.lineJoin != 'round') { c.lineJoin = 'round'; }
    if (c.lineCap != 'round') { c.lineCap = 'round'; }
    if (c.lineWidth != (tool.radius * 2)) { c.lineWidth = tool.radius * 2; }
    if (c.strokeStyle != tool.color) { c.strokeStyle = tool.color };
    if (c.fillStyle != tool.color) { c.fillStyle = tool.color; }
    if (c.globalCompositeOperation != tool.globalCompositeOperation) {
        c.globalCompositeOperation = tool.globalCompositeOperation;
    }
    return c;
}

/* Stroke Class */

var Stroke = function (tool, canvas, strokeCanvas) {
    this.tool = tool;
    this.path = [];
    this.canvas = canvas;
    this.strokeCanvas = strokeCanvas;
    this.strokeContext = strokeCanvas.getContext('2d');
}

Stroke.prototype.draw = function (canvas) { 
    setContextValues(canvas, this.tool);
    var ctx = canvas.getContext('2d');
    if (this.tool.type == 'eraser') {
        if (this.strokeContext.globalCompositeOperation != 'xor') {
            this.strokeContext.globalCompositeOperation = 'xor';
        }
    }

    ctx.beginPath();
    if (this.path.length > 2) {
        var i;
        //Draw bezier curve to the midpoint of stroke[i] and stroke[i + 1], using stroke[i] as a control point
        //This is what keeps the lines smooth
        for (i = 0; i < this.path.length - 2; i++) {
            var C = (this.path[i].x + this.path[i + 1].x) / 2;
            var D = (this.path[i].y + this.path[i + 1].y) / 2;

            ctx.quadraticCurveTo(this.path[i].x, this.path[i].y, C, D);
        }

        ctx.quadraticCurveTo(
            this.path[i].x,
            this.path[i].y,
            this.path[i + 1].x,
            this.path[i + 1].y
        );
    } else {
        //There are too few points to do a bezier curve, so we just draw the point
        ctx.lineWidth = 1;
        ctx.arc(this.path[0].x, this.path[0].y, currTool.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }
    ctx.stroke();
}

Stroke.prototype.begin = function (pos) {
    this.path.push(pos);

    this.strokeContext.globalAlpha = 1;
    this.strokeContext.drawImage(this.canvas, 0, 0);
    this.strokeContext.globalAlpha = currTool.opacity;
    $(this.canvas).hide();

    this.draw(this.strokeCanvas);
}

Stroke.prototype.update = function (pos) {
    document.getSelection().removeAllRanges();
    this.path.push(pos);
    clearCanvas(strokeLayer);
    strokeContext.globalAlpha = 1;
    strokeContext.drawImage(layers[currentLayer], 0, 0);
    strokeContext.globalAlpha = currTool.opacity;
    this.draw(this.strokeCanvas);
}

Stroke.prototype.end = function (pos) {
    this.path.push(pos);
    clearCanvas(this.strokeCanvas);

    $(this.canvas).show();
    this.draw(this.canvas);

    this.path = [];
}

/* Baisc Canvas Operations */

/*
 * Clears a canvas
 * @param {canvas} canvas - The canvas to be cleared
 */
function clearCanvas(canvas) { 
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/*
 * Gets the current mouse position relative to the top left corner of the canvas
 *
 * @param {canvas} canvas - The canvas that the position should be relative to
 * @param {event} evt - The mouse event used to get the new mouse position
 */
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
	    x: (evt.clientX - rect.left)/(rect.right-rect.left)*canvas.width,
	    y: (evt.clientY - rect.top)/(rect.bottom-rect.top)*canvas.height
    };
}

/*
 * Copies a canvas onto another canvas
 *
 * @param {canvas} mergeTo - The layer to mergo onto
 * @param {array} mergeFrom - The canvas to merge from 
 */
function merge(mergeTo, mergeFrom) {
    mergeContext = mergeTo.getContext('2d');
    if(mergeFrom instanceof HTMLCanvasElement) {
        mergeContext.drawImage(mergeFrom, 0, 0);
    } else if (mergeFrom instanceof Array) {
        for(var i = layers.length - 1;i>=0; i--) {
	        if($(layers[i]).is(':visible')) {
	            mergeContext.drawImage(mergeFrom[i], 0, 0);
	        }
        }
    } else {
        console.log('Error merging layers');
    }
    return mergeTo;
}

function createText(text, font, pos, canvas) {
    var ctx = layers[currentLayer].getContext('2d');
    ctx.font = font;

    ctx.fillText(text, pos.x, pos.y);
    addChange();
}

function drawCursor(pos) {
    if (cursorInWindow) {
        mouseContext.clearRect(0,0, mouseLayer.width, mouseLayer.height);
        mouseContext.beginPath();
        mouseContext.arc(pos.x, pos.y, currTool.radius, 0, 2 * Math.PI, false);
        mouseContext.fill();
        mouseContext.stroke();
   }
}

/*
 * Saves a canvas to an image and opens it in the browser
 *
 * @param {canvas} canvas - The canvas to save
 */
function saveCanvasToImage(canvas) {
    var filename = prompt('File name:');
    if(!(filename == '') && !(filename == null)) {
        $('<a href="' + canvas.toDataURL() + '" download="' + filename + '"></a>')[0].click();
    }
}

/* 
 * Saves a canvas to localStorage
 *
 * @param {canvas} source - The canvas to save
 */
function saveCanvasToStorage(source) {
   localStorage.setItem('canvas', source.toDataURL());
}

function loadCanvasFromStorage(destination) {
    try {
        if (localStorage.getItem('canvas')) {
            var img = new Image;
            img.src = localStorage.getItem('canvas');
            destination.getContext('2d').drawImage(img, 0, 0);
            localStorage.removeItem('canvas');
        }
    } catch (e) {}
}

function drawBlob(blob, pos, canvas) {
    var reader = new FileReader();
    reader.onload = function () {
        var img = new Image();
        img.src = reader.result;
        img.onload = function () {
            layers[currentLayer].getContext('2d').drawImage(img, pos.x, pos.y);
        }
    }
    reader.readAsDataURL(blob);

}

/* Canvas history */
//TODO: This could probably use another rewrite, it really sucks
var changes = [];
var currentChange;

function addChange() {
    currentChange++;

    if (currentChange != changes.length) {
        changes.splice(currentChange, changes.length - currentChange);
    }

    changes.push({ layer: currentLayer, context: layers[currentLayer].toDataURL() });
}

function undo() { 
    if(currentChange > 0) {
        currentChange--;
        updateCanvas();
    } else { //Hack to allow undoing to blankness
        for(var i=0; i<layers.length; i++) {
            clearCanvas(layers[i]);
        }
        clearCanvas($('#background').get(0));
    }
}

function redo() {
    console.log(currentChange);
    if(currentChange < changes.length - 1) {
        currentChange++;
        updateCanvas();
    }
}

function updateCanvas() {
    var newElement = changes[currentChange];
    var newLayer =  layers[newElement.layer];
    clearCanvas(newLayer);

    var img = new Image();
    img.src = newElement.context;

    newLayer.getContext('2d').globalAlpha = 1;
    newLayer.getContext('2d').drawImage(img, 0, 0);
    newLayer.getContext('2d').globalAlpha = currTool.opacity;

    layers[newElement.layer] = newLayer;
}
