var pos = {x: 0, y: 0};

var tool = 'pencil';
var color = '#149AB4';
var color1 = color;
var color2 = '#FF0000';
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

var toolbox = new AppWindow(6, 2, 'Toolbox');
var colorwindow = new AppWindow(2, 1, 'Colors');
var layerwindow = new AppWindow(1, 4, 'Layers');
var aboutwindow = new AppWindow(1, 1, 'About');
var helpwindow = new AppWindow(1, 1, 'Help');

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

    toolbox.addItem( 0, 0, '<img src="img/toolbox/pencil.png" class="selectedTool" />', 'toolbox-pencil', function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-pencil').addClass('selectedTool');
        tool = 'pencil';

        mouseContext.fillStyle = color;
    });

    toolbox.addItem( 0, 1, '<img src="img/toolbox/eraser.png" />', 'toolbox-eraser', function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-eraser').addClass('selectedTool');
        tool = 'eraser';

        mouseContext.fillStyle = 'rgba(0, 0, 0, 0)';
;
    });

    toolbox.addItem( 1, 0, '<img id="color1" src="img/toolbox/color1.png" />', 'toolbox-color1', function() {
        colorwindow.toggle();
    });
 
    toolbox.addItem( 1, 1, '<img id="color2" src="img/toolbox/color2.png" />', 'toolbox-color2', function() {
        colorwindow.toggle();
    });

    toolbox.addItem( 2, 0, '<img src="img/toolbox/undo.png" />', 'toolbox-undo', function() {
        undo();
    });

    toolbox.addItem( 2, 1, '<img src="img/toolbox/redo.png" />', 'toolbox-redo', function() {
        redo();
    });

    toolbox.addItem( 3, 0, '<img src="img/toolbox/save.png" />', 'toolbox-save', function() {
        saveCanvasToImage(merge($('#background').get(0), layers));
        clearCanvas($('#background').get(0));
    });

    toolbox.addItem( 3, 1, '<img src="img/toolbox/clear.png">', 'toolbox-clear', function() {
        if( confirm( 'Clear all layers?' ) ) {
            for( var i = 0; i < layers.length; i++ ) {
                clearCanvas( layers[ i ] );
            }
            clearCanvas( $( '#background' ).get( 0 ) ); 
         }
    });

    toolbox.addItem( 4, 0, '<img src="img/toolbox/info.png">', 'toolbox-info', function() {
            aboutwindow.toggle();
    });

    toolbox.addItem( 4, 1, '<img src="img/toolbox/help.png">', 'toolbox-help', function() {
            helpwindow.toggle();
    });


    layerwindow.addItem( 0, 0, '<img src="img/layers/layerAdd.png" />', 'layer-add', function() {
        console.log('ADD LAYER');
    });

    layerwindow.addItem( 0, 1, '<img src="img/layers/layerRemove.png" />', 'layer-remove', function() {
        console.log('REMOVE LAYER');
    });

    layerwindow.addItem( 0, 2, '<img src="img/toolbox/clear.png" />', 'layer-clear', function() {
        if( confirm( 'Clear current Layer?' ) ){
            clearCanvas( layers[ currentLayer ] );
        }
    });

    layerwindow.addItem( 0, 3, '<img src="img/toolbox/save.png" />', 'layer-save', function() {
        saveCanvasToImage( layers[ currentLayer ] );
    });
 
    colorwindow.addItem(1, 0, '<input type="color" id="color1-select"></input><br/><input type="color" id="color2-select"></input>', 'color-main', function() {});

    aboutwindow.addItem(0, 0,
        '<div style="max-width: 500px">' +
        '<img style="float:left; width:250px; height:250px;" src="img/logo.png"/>' +
        '<p>Hello! This project is still in development, but thank you for using it!</p>'+
        '<p>If you have comments or suggestions, feel free to email me at mcintire.evan@gmail.com, Id love to hear from you!</p>' +
        '<p> If you want, you can try out the beta <a href="http://draw.evanmcintire.com/beta/drawingapp/" target="_blank"> here</a>.</p>' +
        '<p style="clear: both"> You can also look at the source code <a href="https://github.com/McIntireEvan/drawingapp" target="_blank"> here</a>. This program is provided under the GNU GPL v2</p>' +
        '<h3>Credits</h3>' +
        '<ul>' +
        '<li> Programming: Evan McIntire (mcintire.evan@gmail.com)</li>' +
        '<li> Graphics: Andy Hoang (powergrip776@gmail.com)</li>' +
        '</ul>' +
        '</div', 'about-main', function() {});

    helpwindow.addItem(0, 0, 
        '<table><tr><th colspan=2>Controls</th></tr>' +
        '<tr><td> + </td><td> Increase brush size</td></tr>' +
        '<tr><td> - </td><td> Decrease brush size</td></tr>' +
        '<tr><td> Shift & + </td><td> Increase opacity</td></tr>' +
        '<tr><td> Shift & - </td><td> Decrease opacity</td></tr>' +
        '<tr><td> Control & Z </td><td> Undo </td></tr>' +
        '<tr><td> Control & Y </td><td> Redo</td></tr>' +
        '<tr><td> Control & Q </td><td> Reset window positions </td></tr>' +
        '</table>', 'help-main', function() {});

    addEventListeners();
}

function addEventListeners() {
    $(document).keydown(function(e) {
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
            }
        } else {
            if ( e.which == 187) {
                radius++;
            } else if ( e.which == 189 ) {
                if ( radius > 1 ) {
                    radius--;
                }
            }
        }

        drawCursor( pos );  
        currentContext.lineWidth = radius * 2;
        strokeContext.lineWidth = radius * 2;
        $('#opacity').text = opacity;
    });

    $(document).on('mousedown', '#ToolboxWindow .AppWindowItem', function() {
        $(this).addClass('selectedTool');
    });

    $( document ).on('mouseup mouseout', function(evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-' + tool).addClass('selectedTool');
        endStroke(evt);
    });

    $( document ).on( 'mousemove', function(evt) {
        previousPos = pos;
        pos = getMousePos(mouseLayer, evt);
        drawCursor( pos );
        updateStroke();
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
}

function undo() { 
    if(currentChange > 0) {
        currentChange--;
        doLayerRedraw();
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

//TODO: Give this a better name
function doLayerRedraw() {
    var newElement = changes[currentChange];
    var newLayer =  layers[newElement.layer];
    clearCanvas(newLayer);
    //TODO: Find a way around this?
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
        if(evt.which == 1) {
            color = color1;
        } else {
            color = color2;
        }
    }
    mouseDown = true;
    mouseContext.fillStyle = color;
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
        pos = getMousePos(mouseLayer, evt);
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
        c.strokeStyle = color;
        if(c.fillStyle != color) { c.fillStyle = color;}
        c.globalCompositeOperation = 'source-over';
    } else {
        //TODO: make more effecient
        c.strokeStyle = 'rgba(255, 255, 255, 1)';
        c.fillStyle = 'rgba(255, 255, 255, 1)';
        c.globalCompositeOperation = 'destination-out';
        strokeContext.globalCompositeOperation = 'source-over';
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
    init();
    console.log('Loading complete');
    $('#splash').fadeOut(1500);

    toolbox.appendToBody(false, 0, 0);
    aboutwindow.appendToBody(true, 100, 100);
    colorwindow.appendToBody(true, 100, 0);
    helpwindow.appendToBody(true, 100, 50);
    $('#color1-select').val(color1);
    $('#color2-select').val(color2);
    $('#color1').css({'background':color});
    $('#color2').css({'background':color2});
});
