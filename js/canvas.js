/* Variables */
var pos = {x: 0, y: 0};
var lastPos = pos;

var color = '#81CD29';
var color1 = color;
var color2 = '#FFFFFF';
var transparent = 'rgba(255,255,255,1)';

var tool = 'pencil';
var radius = 3;
var opacity = 1;

var mouseLayer = $('#mouse').get(0);
var mouseContext = mouseLayer.getContext('2d');
var mouseDown = false;

var layers = [$('#layer0').get(0), $('#layer1').get(0)];
var currentLayer = 0;
var nextLayer = 2;

var stroke = [];
var strokeLayer = $('#stroke').get(0);
var strokeContext = strokeLayer.getContext('2d');

var width = 0;
var height = 0;

/* Stroke functions */
function beginStroke(evt) {
    stroke.push(pos);

    if(tool == 'pencil') {
        mouseContext.fillStyle = color;
    }
    strokeContext.globalAlpha = 1;
    strokeContext.drawImage(layers[currentLayer], 0, 0);
    strokeContext.globalAlpha = opacity;
    $(layers[currentLayer]).hide();

    drawStrokeToCanvas(stroke, strokeLayer, tool);
}

function updateStroke(stroke, pos) {
    document.getSelection().removeAllRanges();
    stroke.push(pos);
    clearCanvas(strokeLayer);
    strokeContext.globalAlpha = 1;
    strokeContext.drawImage(layers[currentLayer], 0, 0);
    strokeContext.globalAlpha = opacity;
    drawStrokeToCanvas(stroke, strokeLayer, tool);
}

function endStroke(evt) {
    stroke.push(pos);
    clearCanvas(strokeLayer);
    mouseDown = false;
    $(layers[currentLayer]).show();
    drawStrokeToCanvas(stroke, layers[currentLayer], tool);
    addChange();
    lastPos = stroke[stroke.length - 1];

    stroke = [];
    clearCanvas(mouseLayer);
}

function setContextValues(canvas) {
    var c = canvas.getContext('2d');
    if (c.globalAlpha != opacity) { c.globalAlpha = opacity; }
    if (c.lineJoin != 'round') { c.lineJoin = 'round'; }
    if (c.lineCap != 'round') { c.lineCap = 'round'; }
    if (c.lineWidth != (radius * 2)) { c.lineWidth = radius * 2; }

    if (tool == 'pencil') {
        if (c.strokeStyle != color) { c.strokeStyle = color };
        if (c.fillStyle != color) { c.fillStyle = color; }
        if (c.globalCompositeOperation != 'source-over') {
            c.globalCompositeOperation = 'source-over';
        }
    } else {
        if (c.strokeStyle != transparent) { c.strokeStyle = transparent; }
        if (c.fillStyle != transparent) { c.fillStyle = transparent; }
        if (c.globalCompositeOperation != 'destination-out') {
            c.globalCompositeOperation = 'destination-out';
        }
    }
    return c;
}

function drawStrokeToCanvas(stroke, canvas, tool) {
    setContextValues(canvas);
    var c = canvas.getContext('2d');
    if(tool == 'eraser') {
        if (strokeContext.globalCompositeOperation = 'source-over') {
            strokeContext.globalCompositeOperation = 'source-over';
        }
    }

    c.beginPath();
    if (stroke.length > 2) {
        var i;
        //Draw bezier curve to the midpoint of stroke[i] and stroke[i + 1], using stroke[i] as a control point
        //This is what keeps the lines smooth
        for (i = 0; i < stroke.length - 2; i++) {
            var C = (stroke[i].x + stroke[i + 1].x) / 2;
            var D = (stroke[i].y + stroke[i + 1].y) / 2;

            c.quadraticCurveTo(stroke[i].x, stroke[i].y, C, D);
        }
        
        c.quadraticCurveTo(
            stroke[i].x,
            stroke[i].y,
            stroke[i + 1].x,
            stroke[i + 1].y
        );
    } else {
        //There are too few points to do a bezier curve, so we just draw the point
        c.lineWidth = 1;
        c.arc(stroke[0].x, stroke[0].y, radius, 0, 2 * Math.PI, false);
        c.fill();
        c.stroke();
    }
    c.stroke();
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

function createText(font, color, pos, canvas) {
    var ctx = canvas.getContext('2d');
    var string = prompt('Text:');
    if (string == 'null' || string == '' || string == null) {
        return;
    }
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(string, pos.x, pos.y);
    console.log(ctx);
    addChange();
}

function drawCursor(pos) {
    if (cursorInWindow) {
        mouseContext.clearRect(0,0, mouseLayer.width, mouseLayer.height);
        mouseContext.beginPath();
        mouseContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
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
    newLayer.getContext('2d').globalAlpha = opacity;

    layers[newElement.layer] = newLayer;
}
