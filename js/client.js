var toolbox = new AppWindow(6, 2, 'Toolbox');
var colorwindow = new AppWindow(2, 1, 'Colors');
var layerwindow = new AppWindow(1, 4, 'Layers');
var aboutwindow = new AppWindow(1, 1, 'About');
var helpwindow = new AppWindow(1, 1, 'Help');

function initDesktopClient() {
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
 
    colorwindow.addItem(1, 0, '<input type="color" id="color1-select"></input><br/>'+
            '<input type="color" id="color2-select"></input>', 'color-main', function() {});

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
        '<tr><td> X </td><td> Swap primary and secondary color </td></tr>' +
        '<tr><td> Shift & + </td><td> Increase opacity</td></tr>' +
        '<tr><td> Shift & - </td><td> Decrease opacity</td></tr>' +
        '<tr><td> Control & Z </td><td> Undo </td></tr>' +
        '<tr><td> Control & Y </td><td> Redo</td></tr>' +
        '<tr><td> Control & S </td><td> Save </td></tr>' +
        '<tr><td> Control & Q </td><td> Reset window positions </td></tr>' +
        '</table>', 'help-main', function() {});

    toolbox.appendToBody(true, 0, 0);
    aboutwindow.appendToBody(false, 100, 100);
    colorwindow.appendToBody(false, 100, 0);
    helpwindow.appendToBody(false, 100, 50);

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

    $(document).on('mouseup mouseout', function(evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-' + tool).addClass('selectedTool');
        pos = getMousePos(mouseLayer, evt);
        endStroke(evt);
    });

    $(document).on( 'mousemove', function(evt) {
        pos = getMousePos(mouseLayer, evt);
        drawCursor( pos );
        updateStroke();
    });

    $(mouseLayer).on( 'mousedown', function(evt) {
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

}

function initMobileClient() {
    $(document).on('touchstart', function(evt) {
        beginStroke(evt.originalEvent.changedTouches[0]);
    });

    $(document).on('touchmove', function(evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.touches[0]);
        updateStroke();
    });

    $(document).on('touchend', function(evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.changedTouches[0]);
        endStroke(evt.originalEvent.changedTouches[0]);
    });
}

function initShared() {
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


    $(window).unload(function() {
        saveCanvasToStorage(merge($('#background').get(0), layers));
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
