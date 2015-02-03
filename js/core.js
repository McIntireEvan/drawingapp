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
var nextLayerId = 2;
var currentContext = layers[currentLayer].getContext('2d');

var stroke = [];
var strokeLayer = $('#stroke').get(0);
var strokeContext = strokeLayer.getContext('2d');

var changes = [];
var currentChange;

var cursorInWindow = true;

function init() {
    prepareCanvas(mouseLayer);
    for(var i = 0; i < layers.length; i++) {
        prepareCanvas( layers[i]);
    }
    prepareCanvas( $('#background').get(0) );
    prepareCanvas(strokeLayer);

    mouseContext.lineWidth = 1;
    mouseContext.strokeStyle = 'black';
    mouseContext.fillStyle = color;

    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange = 0;
    strokeContext.globalCompositeOperation = 'source-over';

    $('#color1-select').val(color1);
    $('#color2-select').val(color2);
    $('#color1').css({'background':color});
    $('#color2').css({'background':color2});

    loadCanvasFromStorage(layers[currentLayer]);

    addEventListeners();
}

function addEventListeners() {
    $(document).keydown(function(e) {
        if(!mouseDown) {
            if ( e.shiftKey ) {
                if ( e.which == 187 ) {
                    if ( opacity < 1.0 ) {
                       opacity += 0.01;
                    }
                } else if ( e.which == 189 ) {
                    if(opacity > 0) {
                        opacity -= 0.01;
                    }
                }
            } else if ( e.ctrlKey ) {
                if ( e.which==90 ) {
                    undo();
                } else if ( e.which==89 ) {
                    redo();
                } else if ( e.which==81 ) {
                    toolbox.setPos( 0, 0);
                    aboutwindow.setPos( 100, 100 );
                    colorwindow.setPos( 100, 0 );
                    helpwindow.setPos( 100, 50);
                } else if (e.which == 83) {
                    e.preventDefault();
                    saveCanvasToImage(merge($('#background').get(0), layers));
                    clearCanvas($('#background').get(0));
                }
            } else {
                if ( e.which == 187) {
                    radius++;
                } else if ( e.which == 189 ) {
                    if ( radius > 1 ) {
                        radius--;
                    }
                } else if( e.which == 88) {
                    var temp = color1;
                    color1 = color2;
                    color2 = temp;
                    color = color1;
                    $('#color1').css({'background':color});
                    $('#color2').css({'background':color2});
                }
            }
        }

        drawCursor(pos);
        currentContext.lineWidth = radius * 2;
        strokeContext.lineWidth = radius * 2;
    });

    $(document).on('mousedown', '#ToolboxWindow .AppWindowItem', function() {
        $(this).addClass('selectedTool');
    });

    $( document ).on('touchend', function(evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.changedTouches[0]);
        endStroke(evt.originalEvent.changedTouches[0]);
    });

    $( document ).on('mouseup mouseout', function(evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-' + tool).addClass('selectedTool');
        pos = getMousePos(mouseLayer, evt);
        endStroke(evt);
    }); 

    $( document ).on( 'mousemove', function(evt) {
        pos = getMousePos(mouseLayer, evt);
        drawCursor( pos );
        updateStroke();
    });
    
    $( document ).on( 'touchmove', function(evt) {
        if(evt.originalEvent.touches.length === 2) {
            return;
        }
        pos = getMousePos(mouseLayer, evt.originalEvent.touches[0]);
        updateStroke();
    });

    $( mouseLayer ).on( 'touchstart', function(evt) {
        beginStroke(evt.originalEvent.changedTouches[0]);
    });

    $( mouseLayer ).on( 'mousedown', function(evt) {
        beginStroke(evt);
    });

    $(document).on('mouseenter', function() {
        cursorInWindow = true;
        clearCanvas( mouseLayer );
    });

    $(document).on('mouseleave', function() {
        cursorInWindow = false;
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
        prepareCanvas($('#background').get(0));
        prepareCanvas(strokeLayer);
    });

    $(document).on('change', '#color1-select', function() {
        color1 = $('#color1-select').val();
        $('#color1').css({'background':color1});

        if( tool == 'pencil' ) {
            mouseContext.fillStyle = color1;
        }
    });

    $(document).on('change', '#color2-select', function() {
        color2 = $('#color2-select').val();
        $('#color2').css({'background':color2});

        if( tool == 'pencil' ) {
            mouseContext.fillStyle = color2;
        }
    });

    $(document).bind('contextmenu', function(event) {       
        event.preventDefault();
    });

    $(window).unload(function() {
        saveCanvasToStorage(merge($('#background').get(0), layers));
    });
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

function drawCursor( pos ) {
    if ( cursorInWindow ) {
        mouseContext.clearRect(0,0, mouseLayer.width, mouseLayer.height);
        mouseContext.beginPath();
        mouseContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
        mouseContext.fill();
        mouseContext.stroke();
   }
}

function prepareCanvas(canvas) {
   canvas.width = $('#mouse').css('width').replace('px','');
   canvas.height = $('#mouse').css('height').replace('px','');
}

$(document).ready(function() {
    initClient();
    init();
    console.log('Loading complete');
    $('#splash').fadeOut(1500);
});
