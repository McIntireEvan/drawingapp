var cursorInWindow = true;
var width = 0;
var height = 0;

function initDesktopClient() {
    $('#toolbox .body').append(
        $('#ToolboxWindow').html()
    ).on('click', '#toolbox-brush', function (evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#toolbox-brush, #pencil').addClass('selectedTool');
        currTool = pencil;
        mouseContext.fillStyle = color;
    }).on('dblclick', '#toolbox-brush', function() {
        $('#brush').toggle();
    }).on('click', '#eraser', function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#eraser').addClass('selectedTool');
        currTool = eraser;
        mouseContext.fillStyle = 'rgba(0, 0, 0, 0)';
    }).on('click', '#text', function () {
        currTool = text;
        $('.selectedTool').removeClass('selectedTool');
        $('#text').addClass('selectedTool');
        $('canvas').css('cursor','crosshair');
    }).on('click', '#eyedropper', function() {
        currTool = eyedropper;
        $('.selectedTool').removeClass('selectedTool');
        $('#eyedropper').addClass('selectedTool');
    }).on('click', '#color1', function () {
        if($('.cw1').length == 1) {
            $('#color').removeClass('cw1').hide();
            return;
        } else {
            $('#color').addClass('cw1').removeClass('cw2').show();
        }
        $('#color .body').html('').colorwheel({size: 200, ringSize: 20, onInput: function(evt) {
            var newColor = evt.color;
            color1 = 'rgb(' + newColor.r + ',' + newColor.g + ',' + newColor.b + ')';
            $('#color1').css('background',color1);
        }});
    }).on('click', '#color2', function () {
        if($('.cw2').length == 1) {
            $('#color').removeClass('cw2').hide();
            return;
        } else {
            $('#color').addClass('cw2').removeClass('cw1').show();
        }
        $('#color .body').html('').colorwheel({size: 200, ringSize: 20, onInput: function(evt) {
           var newColor = evt.color;
           color2 = 'rgb(' + newColor.r + ',' + newColor.g + ',' + newColor.b + ')';
           $('#color2').css('background',color2);
        }});   
    }).on('click', '#undo', function () {
        undo();
    }).on('click', '#redo', function () {
        redo();
    }).on('click', '#saveall', function () {
        saveCanvasToImage(merge($('#background').get(0), layers));
        clearCanvas($('#background').get(0));
    }).on('click', '#clearall', function () {
        if (confirm('Clear all layers?')) {
            for (var i = 0; i < layers.length; i++) {
                clearCanvas(layers[i]);
            }
            clearCanvas($('#background').get(0));
        }
    }).on('click', '#infotoggle', function () {
        $('#about').toggle();
    }).on('click', '#helptoggle', function () {
        $('#help').toggle();
    }).on('click', '#invite', function() {
        initOnline();
        alert('Online activated: Invite people with the URL ' + window.location.href);
    }).on('click', '#settingstoggle', function() {
        $('#settings').toggle();
    });
    $('#ToolboxWindow').remove()
    
    var onLayerClick = function () {
        currentLayer = parseInt(this.id.replace('layer', '').replace('-control', ''));
        $('.selectedRow').removeClass('selectedRow');
        $(this).addClass('selectedRow');
        $(strokeLayer).css({ 'z-index': currentLayer });
        if ($(layers[currentLayer]).is(':visible')) {
            $('#layer-visible').html('<img src="img/icons/layervisible.png" />');
        } else {
            $('#layer-visible').html('<img src="img/icons/layerhidden.png" />');
        };
        setIconSize();
        var opacity = Math.round($(layers[currentLayer]).css('opacity') * 100);
        $('#layer-opacity').val(opacity);
        $('#opacity-value').html(opacity);
        $(strokeLayer).css('opacity', opacity);
    };

    var onDoubleClick = function () {
        if ($('#newName').length != 0) {
            return;
        }
        var input = $('<input/>').attr({
            type: 'text',
            id: 'newName',
            value: $(this).html()
        }).on('blur', function () {
            if ($('#newName').val() != '') {
                $(this).parent().html($('#newName').val());
            }
        });
        $(this).html(input);
        input.focus();
    };

    var createLayer = function () {
        $('<canvas>').attr({
            id: 'layer' + nextLayer,
            style: 'z-index:' + nextLayer
        }).appendTo('body');

        $('<div/>')
            .attr('id', 'layer' + nextLayer + '-control')
            .html('Layer ' + nextLayer)
            .on('click', onLayerClick).on('dblclick', onDoubleClick)
            .appendTo("#layer-list");

        layers.push($('#layer' + nextLayer).get(0));
        prepareCanvas($('#layer' + nextLayer).get(0));

        $('#layer' + currentLayer + '-control').addClass('selectedRow');
        nextLayer++;
    };

    var removeCurrentLayer = function() {
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

    $('<div/>')
        .attr('id', 'layer0-control')
        .html('Layer 0')
        .on('click', onLayerClick).on('dblclick', onDoubleClick)
        .appendTo("#layer-list");

    $('#layers .body').append($('#LayersWindow').html()).on('click', '#layer-add', function () {
        createLayer();
    }).on('click', '#layer-remove', function () {
        if (confirm('Remove '+ $('#layer' + currentLayer + '-control').html() + '?')) {
            if ($('#Layers div').length == 1) {
                return;
            }
            removeCurrentLayer();
        }
    }).on('click', '#layer-clear', function () {
        if (confirm('Clear ' + $('#layer' + currentLayer + '-control').html() + ' ?')) {
            clearCanvas(layers[currentLayer]);
        }
    }).on('click', '#layer-save', function () {
        saveCanvasToImage(layers[currentLayer]);
    }).on('click', '#layer-visible', function () {
        if ($(this).html().indexOf('visible') != -1) {
            $(this).html('<img src="img/icons/layerhidden.png" />');
            $('#layer' + currentLayer + '-control').css('font-stlye','italic');
        } else {
            $(this).html('<img src="img/icons/layervisible.png" />');
            $('#layer' + currentLayer + '-control').css('font-stlye', 'normal');
        };
        setIconSize();
        $(layers[currentLayer]).toggle();
    }).on('click', '#layer-mergedown', function () {
        var next = $('#layer' + currentLayer + '-control').next();
        if (next.length != 0) {
            var nextId = parseInt(next.get(0).id.replace('layer', '').replace('-control', ''));
            layers[nextId] = merge($(layers[nextId]).get(0), $(layers[currentLayer]).get(0));
            removeCurrentLayer();
        }
    });

    $('#LayersWindow').remove();
    $('#layer-opacity').on('input', function () {
        $('#opacity-value').html($(this).val());
        $(strokeLayer).css('opacity', $(this).val() / 100);
        $(layers[currentLayer]).css('opacity', $(this).val() / 100);
    });

    $('#brush-opacity').on('input', function () {
        $('#brush-opacity-value').html($(this).val());
        currTool.opacity = ($(this).val()/ 100);
        $(mouseLayer).css('opacity', currTool.opacity);
    });

    $('#brush-size').on('input', function () {
        $('#brush-size-value').html($(this).val());
        currTool.radius = $(this).val();
    });

    $('#color .body').append($('#ColorWindow'));
    $('#color .head .close').on('click', function() {
        $('#color').removeClass('cw1 cw2');
    });
    $('#about .body').append($('#AboutWindow'));
    $('#help .body').append($('#HelpWindow'));
    $('#brush .body').append($('#BrushWindow'));
    $('#settings .body').append($('#SettingsWindow'));
    $('#help, #about, #brush, #settings, #color').hide();
    $('#toolbox .head .close, #layers .head .close').html('');

    $('#32px').on('click', function() {
        localStorage.setItem('iconSize','32px');
        setIconSize();
    });

    $('#48px').on('click', function() {
        localStorage.setItem('iconSize','48px');
        setIconSize();
    });

    $('#64px').on('click', function() {
        localStorage.setItem('iconSize','64px');
        setIconSize();
    });

    var iconSize = localStorage.getItem('iconSize');
    if(iconSize == null) {
        iconSize = '48x48';
    }
    setIconSize();
    $('#layer0-control').addClass('selectedRow');

    $.getScript('js/modules/keybinds.js');

    $(document).on('wheel', function(evt) {
        evt.preventDefault();
        var e = evt.originalEvent;
        if(!mouseDown) {
            if(evt.shiftKey) {
                if(e.deltaX < 0) {
                    if (currTool.opacity < 1.0) {
                        currTool.opacity += 0.01;
                    }
                } else {
                    if (currTool.opacity > .01) {
                        currTool.opacity -= 0.01;
                    }
                }
                $(mouseLayer).css('opacity', currTool.opacity);
                var o = Math.round(currTool.opacity * 100);
                $('#brush-opacity-value').html(o);
                $('#brush-opacity').val(o);

            } else {
                if(e.deltaY < 0) {
                    currTool.radius++;
                } else {
                    if ( currTool.radius > 1 ) {
                        currTool.radius--;
                    }
                }
                $('#brush-size-value').html(currTool.radius);
                $('#brush-size').val(currTool.radius);
            }
            drawCursor(pos);
        }
    }).on('mousedown', '#ToolboxWindow td', function() {
        $(this).addClass('selectedTool');
    }).on('mouseup', function(evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#'+currTool.type).addClass('selectedTool');
        if(currTool.type == 'pencil') {
            $('#toolbox-brush').addClass('selectedTool');
        }
        pos = getMousePos(mouseLayer, evt);
        if (mouseDown) {
            mouseDown = false;
            stroke.end(pos);
            addChange();
            lastPos = pos;
            if (online) {
                socket.emit('endStroke', { pos: pos });
            }
        }
    }).on( 'mousemove', function(evt) {
        pos = getMousePos(mouseLayer, evt);
        if(currTool.type == 'pencil' || currTool.type == 'eraser') {
            drawCursor( pos );
        }
        if (mouseDown) {
            stroke.update(pos);
            if (online) {
                socket.emit('updateStroke', { pos: pos });
            }
        }
    });

    $(mouseLayer).on('mousedown', function (evt) {
        var currentCtx = setContextValues(layers[currentLayer], currTool);
        pos = getMousePos(mouseLayer, evt);
        if (currTool.type == 'pencil' || currTool.type == 'eraser') {
            if (evt.shiftKey) {
                drawLine(currentCtx, lastPos, pos);
                if (online) {
                    socket.emit('drawline', { start: lastPos, end: pos });
                    console.log('gdsgdsg');
                }
                lastPos = { x: pos.x, y: pos.y };
                addChange();
                return;
            } else {
                mouseDown = true;
                if (evt.which == 3) {
                    color = color2;
                } else if (evt.which == 1) {
                    color = color1;
                } else {
                    if (evt.type == 'touchstart') {
                        evt = evt.changedTouches[0];
                    } else {
                        return;
                    }
                }
                if (currTool.type == 'pencil') {
                    mouseContext.fillStyle = color;
                    currTool.color = color;
                }
                stroke = new Stroke(currTool, layers[currentLayer], strokeLayer);
                stroke.begin(pos);
                if (online) {
                    socket.emit('beginStroke', { pos: pos, tool: currTool });
                }
            }
        } else if (currTool.type == 'text') {
            var string = prompt('Text:');
            if (string == 'null' || string == '' || string == null) {
                return;
            }
            currTool.color = color1;
            createText(string, currTool, { x: pos.x, y: pos.y }, layers[currentLayer]);
            if (online) {
                    socket.emit('text', { pos: pos, tool: currTool, text: string });
                }

        } else if(currTool.type == 'eyedropper') {
            var c = currentCtx.getImageData(pos.x, pos.y, 1, 1).data;
            var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';
            color = color1 = nC;
            if(color == 'rgb(0, 0, 0)') {
                color = color1 = '#FFFFFF';
            }
            $('#color1').css({'background':color});
        }
    }).on('mouseenter', function() {
        cursorInWindow = true;
        clearCanvas( mouseLayer );
    }).on('mouseleave', function() {
        cursorInWindow = false;
        clearCanvas( mouseLayer );
    });
}

function setIconSize() {
    var size = localStorage.getItem('iconSize');
    $('.windowfy img').css({
        'width': size,
        'height': size
    });
}

function initShared() {
    initCanvases();
    mouseContext.lineWidth = 1;
    mouseContext.strokeStyle = 'black';
    mouseContext.fillStyle = color;

    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange = 0;

    $('#color1').css({'background':color});
    $('#color2').css({'background':color2});

    loadCanvasFromStorage(layers[currentLayer]);

    $(window).unload(function() {
        saveCanvasToStorage(merge($('#background').get(0), layers));
    });

    $(document).bind('contextmenu', function(evt) {
        evt.preventDefault();
    });
}

function initCanvases() {
    prepareCanvas(mouseLayer);
    for(var i = 0; i < layers.length; i++) {
        prepareCanvas( layers[i]);
    }
    prepareCanvas($('#background').get(0));
    //prepareCanvas($('#layer0-remote').get(0));
    prepareCanvas($('#layer0-remote-stroke').get(0));
    prepareCanvas(strokeLayer);
}

function bindImports() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $(document).on('dragover dragenter', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }).on('drop', function (evt) {
            var files = evt.originalEvent.dataTransfer.files;
            if (files.length == 0) {
                return;
            }
            if(!files[0].type.match('image.*')) {
                return;
            }
            drawBlob(files[0], {x: evt.originalEvent.pageX, y: evt.originalEvent.pageY});
            evt.preventDefault();
            evt.stopPropagation();
        }).on('paste', function(evt) {
            var data = evt.originalEvent.clipboardData;
            if(data) {
                var items = data.items;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        var blob = items[i].getAsFile();
                        drawBlob(blob,{x: pos.x, y: pos.y});
                        return;
                    }
                }
                var files = data.files;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].type.indexOf("image") !== -1) {
                        var blob = files[i];
                        drawBlob(blob, {x: pos.x, y: pos.y});
                        return;
                    }
                }
            }
        });
    } else {
        console.log('Error attaching drop and paste events');
    }
}

function isMobile() {
    return window.matchMedia('(min-device-width : 320px) and (max-device-width : 480px)').matches;
}

function prepareCanvas(canvas) {
    $(canvas).css({'width':width, 'height':height});
    canvas.width = $('#mouse').width();
    canvas.height = $('#mouse').height();
}

$(document).ready(function() {
    width = $('body').css('width');
    height = $('body').css('height');

    createWindows('ext/config.json', function(){
        if(isMobile()) {
            $.getScript('js/modules/mobile.js');
        } else {
            initDesktopClient();
        }
    });

    initShared();
    bindImports();
    $('#splash').fadeOut(1500);
    $('#window-holder').fadeIn(1500);
    if (window.location.href.split('#').length != 1) {
        initOnline();
    }
});
