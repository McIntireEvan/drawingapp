var pos = {x: 0, y: 0};

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

var layers = [$('#layer1').get(0), $('#layer0').get(0)];
var currentLayer = 1;

var stroke = [];
var strokeLayer = $('#stroke').get(0);
var strokeContext = strokeLayer.getContext('2d');

var changes = [];
var currentChange;

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
        doLayerRedraw();
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
    pos = getMousePos(mouseLayer, evt);
    stroke.push(pos);
    if(!mouseDown) {
        if(evt.which == 3) {
            color = color2;
        } else {
            color = color1;
        }
    }
    mouseDown = true;
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
    if(mouseDown) {
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
        stroke=[];
        clearCanvas(mouseLayer);
    }
}

function drawStrokeToCanvas(canvas, color) {
    var c = canvas.getContext('2d');
    if(c.globalAlpha != opacity) { c.globalAlpha = opacity; }
    if(c.lineJoin != 'round') { c.lineJoin = 'round'; }
    if(c.lineWidth != (radius * 2)) { c.lineWidth = radius*2; }

    if(tool == 'pencil') {
        if(c.strokeStyle != color) { c.strokeStyle = color };
        if(c.fillStyle != color) { c.fillStyle = color;}
        if(c.globalCompositeOperation != 'source-over') {
            c.globalCompositeOperation = 'source-over';
        }
    } else {
        if(c.strokeStyle != transparent) { c.strokeStyle = transparent; }
        if(c.fillStyle != transparent) { c.fillStyle = transparent; }
        if(c.globalCompositeOperation != 'destination-out') {
            c.globalCompositeOperation = 'destination-out';
        }
        if(strokeContext.globalCompositeOperation = 'source-over') {
            strokeContext.globalCompositeOperation = 'source-over';
        }
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
    c.globalcompositeoperation = 'source-over';

}

function prepareCanvas(canvas) {
   canvas.width = $('#mouse').css('width').replace('px','');
   canvas.height = $('#mouse').css('height').replace('px','');
}

$(document).ready(function() {
    if(isMobile()) {
        initMobileClient();
    } else {
        initDesktopClient();
    }
    initShared();
    console.log('Loading complete');
    $('#splash').fadeOut(1500);
});
