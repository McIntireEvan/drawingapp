var pos = {x: 0, y: 0};
var lastPos = pos;
var color = '#149AB4';
var color1 = color;
var color2 = '#FFB717';
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

var changes = [];
var currentChange;

var width = 0;
var height = 0;

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

function beginStroke(evt) {
    if(!mouseDown) {
        if(evt.which == 3) {
            color = color2;
        } else if (evt.which == 1) {
            color = color1;
        } else {
            if(evt.type == 'touchstart') {
                evt = evt.changedTouches[0];
            } else {
                return;
            }
        }
    }
    mouseDown = true;
    pos = getMousePos(mouseLayer, evt);
    stroke.push(pos);

    if(tool == 'pencil') {
        mouseContext.fillStyle = color;
    }
    strokeContext.globalAlpha = 1;
    strokeContext.drawImage(layers[currentLayer], 0, 0);
    strokeContext.globalAlpha = opacity;
    $(layers[currentLayer]).hide();

    drawStrokeToCanvas(strokeLayer, color);
}

function updateStroke() {
    if (mouseDown) {
        document.getSelection().removeAllRanges();
        stroke.push(pos);
        clearCanvas(strokeLayer);
        strokeContext.globalAlpha = 1;
        strokeContext.drawImage(layers[currentLayer], 0, 0);
        strokeContext.globalAlpha = opacity;
        drawStrokeToCanvas(strokeLayer, color);
    }
}

function endStroke(evt) {
    if(mouseDown) {
        stroke.push(pos);
        clearCanvas(strokeLayer);
        mouseDown = false;
        $(layers[currentLayer]).show();
        drawStrokeToCanvas(layers[currentLayer], color);
        currentChange++;

        if(currentChange != changes.length) {
            changes.splice(currentChange, changes.length  - currentChange);
        }

        changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
        lastPos = stroke[stroke.length - 1];
        stroke = [];
        clearCanvas(mouseLayer);
    }
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

function drawStrokeToCanvas(canvas, color) {
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
        c.lineWidth = 0;
        c.arc(stroke[0].x, stroke[0].y, radius, 0, 2 * Math.PI, false);
        c.fill();
        c.stroke();
    }
    c.stroke();
}

function prepareCanvas(canvas) {
    //TODO: In node version, set these to value from server
    $(canvas).css({'width':width, 'height':height});
    canvas.width = $('#mouse').width();
    canvas.height = $('#mouse').height();
}

$(document).ready(function() {
    width = $('body').css('width');
    height = $('body').css('height');
    if(isMobile()) {
        initMobileClient();
    } else {
        //Only load jQuery plugins if the desktop client is loaded to save memory and loading times
        initDesktopClient();
    }
    initShared();
    $('#splash').fadeOut(1500);
    $('#window-holder').fadeIn(1500);
});
