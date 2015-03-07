var cursorInWindow = true;

function initDesktopClient() {
    $('#ToolboxWindow').windowfy({
        title: 'Toolbox',
        close: false,
        id: 'ToolboxHolder'
    }).on('click', '#toolbox-pencil', function (evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-pencil').addClass('selectedTool');
        tool = 'pencil';
        mouseContext.fillStyle = color;
    }).on('click', '#toolbox-eraser', function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-eraser').addClass('selectedTool');
        tool = 'eraser';
        mouseContext.fillStyle = 'rgba(0, 0, 0, 0)';
    }).on('click', '#toolbox-color1', function () {
        $('#ColorWindow').parent().toggle();
    }).on('click', '#toolbox-color2', function () {
        $('#ColorWindow').parent().toggle();
    }).on('click', '#toolbox-undo', function () {
        undo();
    }).on('click', '#toolbox-redo', function () {
        redo();
    }).on('click', '#toolbox-save', function () {
        saveCanvasToImage(merge($('#background').get(0), layers));
        clearCanvas($('#background').get(0));
    }).on('click', '#toolbox-clear', function () {
        if (confirm('Clear all layers?')) {
            for (var i = 0; i < layers.length; i++) {
                clearCanvas(layers[i]);
            }
            clearCanvas($('#background').get(0));
        }
    }).on('click', '#toolbox-info', function () {
        $('#AboutWindow').parent().toggle();
    }).on('click', '#toolbox-help', function () {
        $('#HelpWindow').parent().toggle();
    });

    var onLayerClick = function () {
        currentLayer = parseInt(this.id.replace('layer', '').replace('-control', ''));
        $('.selectedRow').removeClass('selectedRow');
        $(this).addClass('selectedRow');
        $(strokeLayer).css({ 'z-index': currentLayer });
    };

    $('#LayersWindow').windowfy({
        title: 'Layers',
        close: false,
        id: 'Layers'
    }).on('click', '#layer-add', function () {
        $('<canvas>').attr({
            id: 'layer' + nextLayer,
            style: 'z-index:' + nextLayer
        }).appendTo('body');

        $('<div/>').attr('id', 'layer' + nextLayer + '-control').html('Layer ' + nextLayer).on('click', onLayerClick).appendTo('#Layers');
        layers.push($('#layer' + nextLayer).get(0));
        prepareCanvas($('#layer' + nextLayer).get(0));
        $('#layer' + currentLayer + '-control').addClass('selectedRow');
        nextLayer++;
    }).on('click', '#layer-remove', function () {
        if (confirm('Remove Layer?')) {
            if ($('#Layers div').length == 1) {
                return;
            }
            $('#layer' + currentLayer + '-control').remove();
            $('#layer' + currentLayer).remove();
            layers[currentLayer] = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] != null) {
                    currentLayer = i;
                    break;
                }
            }
            $(strokeLayer).css({ 'z-index': currentLayer });
            $('#layer' + currentLayer + '-control').addClass('selectedRow');
        }
    }).on('click', 'layer-clear', function () {
        if (confirm('Clear current Layer?')) {
            clearCanvas(layers[currentLayer]);
        }
    }).on('click', 'layer-save', function () {
        saveCanvasToImage(layers[currentLayer]);
    });

    for(var i = 0; i < 2; i++) {
        $('<div/>').attr('id', 'layer' + i + '-control').on('click', onLayerClick).html('Layer ' + i).appendTo('#Layers');
    }

    $('#ColorWindow').windowfy({
        title: 'Color',
        exitmode: 'hide'
    }).parent().hide();
    $('#AboutWindow').windowfy({
        title: 'About',
        exitmode: 'hide'
    }).parent().hide();
    $('#HelpWindow').windowfy({
        title: 'Help',
        exitmode: 'hide'
    }).parent().hide();
    $('#layer0-control').addClass('selectedRow');

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
                } else if(e.which == 112) {
                    e.preventDefault()
                    helpwindow.toggle();
                } else if(e.which == 27) {
                    $('#AboutWindow').hide();
                    $('#ColorsWindow').hide();
                    $('#HelpWindow').hide();

                }
            }
        }
        drawCursor(pos);
    });

    $(document).on('wheel', function(evt) {
        evt.preventDefault();
        var e = evt.originalEvent;
        if(!mouseDown) {
            if(evt.shiftKey) {
                if(e.deltaX < 0) {
                    if ( opacity < 1.0 ) {
                       opacity += 0.01;
                    }
                } else {
                    if ( opacity > .01 ) {
                        opacity -= 0.01;
                    }
                }
            } else {
                if(e.deltaY < 0) {
                    radius++;
                } else {
                    if ( radius > 1 ) {
                        radius--;
                    }
                }
            }
            drawCursor(pos);
        }
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

function drawCursor(pos) {
    if (cursorInWindow) {
        mouseContext.clearRect(0,0, mouseLayer.width, mouseLayer.height);
        mouseContext.beginPath();
        mouseContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
        mouseContext.fill();
        mouseContext.stroke();
   }
}
