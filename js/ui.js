var cursorInWindow = true;
var roomId;
var online = false;
var rStrokes = {};

function initDesktopClient() {
    $('#ToolboxWindow').windowfy({
        title: 'Toolbox',
        close: false,
        id: 'ToolboxHolder'
    }).on('click', '#brush', function (evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#brush, #pencil').addClass('selectedTool');
        tool = 'pencil';
        mouseContext.fillStyle = color;
        $('#brushSettings').toggle();
    }).on('click', '#eraser', function() {
        $('.selectedTool').removeClass('selectedTool');
        $('#eraser').addClass('selectedTool');
        tool = 'eraser';
        mouseContext.fillStyle = 'rgba(0, 0, 0, 0)';
    }).on('click', '#text', function () {
        tool = 'text';
        $('.selectedTool').removeClass('selectedTool');
        $('#text').addClass('selectedTool');
        $('canvas').css('cursor','crosshair');
    }).on('click', '#eyedropper', function() {
        tool = 'eyedropper';
        $('.selectedTool').removeClass('selectedTool');
        $('#eyedropper').addClass('selectedTool');
    }).on('click', '#toolbox-color1', function () {
        if($('.cw1').length == 1) {
            $('#ColorWindow').removeClass('cw1').parent().parent().hide();
            return;
        }
        if($('.cw2').length == 0) {
            $('#ColorWindow').addClass('cw1').removeClass('cw2').parent().parent().toggle();
        }
        $('#ColorWindow').html('').colorwheel({size: 200, ringSize: 20, onInput: function(evt) {
            var newColor = evt.color;
            color1 = 'rgb(' + newColor.r + ',' + newColor.g + ',' + newColor.b + ')';
            $('#toolbox-color1 img').css('background',color1);
        }});
    }).on('click', '#toolbox-color2', function () {
        if($('.cw2').length == 1) {
            $('#ColorWindow').removeClass('cw2').parent().parent().hide();
            return;
        }
        if($('.cw1').length == 0) {
            $('#ColorWindow').addClass('cw2').removeClass('cw1').parent().parent().toggle();
        }
        $('#ColorWindow').html('').colorwheel({size: 200, ringSize: 20, onInput: function(evt) {
           var newColor = evt.color;
           color2 = 'rgb(' + newColor.r + ',' + newColor.g + ',' + newColor.b + ')';
           $('#toolbox-color2 img').css('background',color2);
        }});   
    }).on('click', '#undo', function () {
        undo();
    }).on('click', '#redo', function () {
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
        $('#AboutWindow').parent().parent().toggle();
    }).on('click', '#toolbox-help', function () {
        $('#HelpWindow').parent().parent().toggle();
    });

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

    $('#LayersWindow').windowfy({
        title: 'Layers',
        close: false,
        id: 'Layers'
    }).on('click', '#layer-add', function () {
        $('<canvas>').attr({
            id: 'layer' + nextLayer,
            style: 'z-index:' + nextLayer
        }).appendTo('body');

        $('<div/>').attr('id', 'layer' + nextLayer + '-control')
        .html('Layer ' + nextLayer).on('click', onLayerClick)
        .on('dblclick', onDoubleClick)
        .insertAfter('#LayersWindow');
        
        layers.push($('#layer' + nextLayer).get(0));
        prepareCanvas($('#layer' + nextLayer).get(0));

        $('#layer' + currentLayer + '-control').addClass('selectedRow');
        nextLayer++;
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
        } else {
            $(this).html('<img src="img/icons/layervisible.png" />');
        };
        $(layers[currentLayer]).toggle();
    }).on('click', '#layer-mergedown', function () {
        var next = $('#layer' + currentLayer + '-control').next();
        if (next.length != 0) {
            var nextId = parseInt(next.get(0).id.replace('layer', '').replace('-control', ''));
            layers[nextId] = merge($(layers[nextId]).get(0), $(layers[currentLayer]).get(0));
            removeCurrentLayer();
        }
    });

    for(var i = 0; i < 2; i++) {
        $('<div/>').attr('id', 'layer' + i + '-control').html('Layer ' + i).on('click', onLayerClick).on('dblclick', onDoubleClick).insertAfter('#LayersWindow');
    }

    $('#layer-opacity').on('input', function () {
        $('#opacity-value').html($(this).val());
        $(strokeLayer).css('opacity', $(this).val() / 100);
        $(layers[currentLayer]).css('opacity', $(this).val() / 100);
    });

    $('#brush-opacity').on('input', function () {
        $('#brush-opacity-value').html($(this).val());
        opacity = ($(this).val()/ 100);
        $(mouseLayer).css('opacity', opacity);
    });

    $('#brush-size').on('input', function () {
        $('#brush-size-value').html($(this).val());
        radius = $(this).val();
    });

    $('#ColorWindow').windowfy({
        title: 'Color',
        onClose: function() {
            $(this).hide();
            $('#ColorWindow').removeClass('cw1 cw2');
        }
    }).parent().parent().hide();
    $('#AboutWindow').windowfy({
        title: 'About',
        onClose: function() {
            $(this).hide();
        }
    }).parent().parent().hide();
    $('#HelpWindow').windowfy({
        title: 'Help',
        onClose: function() {
            $(this).hide();
        }
    }).parent().parent().hide();
    $('#BrushWindow').windowfy({
        title: 'Brush Settings',
        onClose: function () {
            $(this).hide();
        },
        id: 'brushSettings'
    }).parent().parent().hide();

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
                $(mouseLayer).css('opacity', opacity);
                var o = Math.round(opacity * 100);
                $('#brush-opacity-value').html(o);
                $('#brush-opacity').val(o);
            } else if ( e.ctrlKey ) {
                if ( e.which==90 ) {
                    undo();
                } else if ( e.which==89 ) {
                    redo();
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
                    $('#HelpWindow').parent().toggle();
                } else if(e.which == 27) {
                    $('#AboutWindow').parent().hide();
                    $('#ColorsWindow').parent().hide();
                    $('#HelpWindow').parent().hide();
                } else if (e.which == 13) {
                    $('#newName').trigger('blur');
                }

                $('#brush-size-value').html(radius);
                $('#brush-size').val(radius);

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
                $(mouseLayer).css('opacity', opacity);
                var o = Math.round(opacity * 100);
                $('#brush-opacity-value').html(o);
                $('#brush-opacity').val(o);

            } else {
                if(e.deltaY < 0) {
                    radius++;
                } else {
                    if ( radius > 1 ) {
                        radius--;
                    }
                }
                $('#brush-size-value').html(radius);
                $('#brush-size').val(radius);
            }
            drawCursor(pos);
        }
    });

    $(document).on('mousedown', '#ToolboxWindow td', function() {
        $(this).addClass('selectedTool');
    }).on('mouseup', function(evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#'+tool).addClass('selectedTool');
        if(tool == 'pencil') {
            $('#brush').addClass('selectedTool');
        }
        pos = getMousePos(mouseLayer, evt);
        if (mouseDown) {
            mouseDown = false;
            stroke.end(pos);
            if (online) {
                socket.emit('endStroke', { pos: pos });
            }
        }
    }).on( 'mousemove', function(evt) {
        pos = getMousePos(mouseLayer, evt);
        if(tool == 'pencil' || tool == 'eraser') {
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
        var currentCtx = setContextValues(layers[currentLayer]);
        pos = getMousePos(mouseLayer, evt);
        if (tool == 'pencil' || tool == 'eraser') {
            if (evt.shiftKey) {
                currentCtx.beginPath();
                currentCtx.moveTo(lastPos.x, lastPos.y);
                currentCtx.lineTo(pos.x, pos.y);
                currentCtx.stroke();
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
                if (tool == 'pencil') {
                    mouseContext.fillStyle = color;
                }
                stroke = new Stroke(tool, layers[currentLayer], strokeLayer);
                stroke.begin(pos);
                if (online) {
                    socket.emit('beginStroke', { pos: pos });
                }
            }
        } else if (tool == 'text') {
            createText('32px serif', color, { x: pos.x, y: pos.y }, layers[currentLayer]);
        } else if(tool == 'eyedropper') {
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

function initMobileClient() {
    $(document).on('touchstart', function (evt) {
        stroke = new Stroke(tool, layers[currentLayer], strokeLayer);
        stroke.begin({ 'x': evt.originalEvent.pageX, 'y': evt.originalEvent.pageY })
    });

    $(document).on('touchmove', function (evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.touches[0]);
        evt.preventDefault();
        if (mouseDown) {
            stroke.update(pos);
        }
    });

    $(document).on('touchend', function (evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.changedTouches[0]);
        if (mouseDown) {
            stroke.end(pos);
        }
    });

    $('<input>').attr({
        'type': 'color',
        'class': 'colorpick'
    }).css({
        'left': '-9999px',
        'top': '-9999px',
        'position': 'absolute',
        'z-index': '3000'
    }).appendTo('body');

    $(document).on('change', '.colorpick', function () {
        color = $('.colorpick').val();
        color1 = color;
    });

    $("<div/>").attr({
        'class': 'mobile-toolbox'
    }).appendTo('body');

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Pencil').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('selected');
        $(this).addClass('selected');

        tool = 'pencil';
    });

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Eraser').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('selected');
        $(this).addClass('selected');

        tool = 'eraser';
    })

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Color').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('mobile-selected');
        $(this).addClass('mobile-selected');
        $('.colorpick')[0].click()
    });

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Clear').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('mobile-selected');
        $(this).addClass('mobile-selected');
        if (confirm('Clear?')) {
            for (var i = 0; i < layers.length; i++) {
                clearCanvas(layers[i]);
            }
            clearCanvas($('#background').get(0));
        }
    });

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Save').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('selected');
        $(this).addClass('mobile-selected');

        saveCanvasToImage(merge($('#background').get(0), layers));
        clearCanvas($('#background').get(0));
    });
    $('#layer1').remove();
}

function initShared() {
    prepareCanvas(mouseLayer);
    for(var i = 0; i < layers.length; i++) {
        prepareCanvas( layers[i]);
    }
    prepareCanvas($('#background').get(0));
    prepareCanvas($('#layer0-remote').get(0));
    prepareCanvas($('#layer0-remote-stroke').get(0));
    prepareCanvas(strokeLayer);

    mouseContext.lineWidth = 1;
    mouseContext.strokeStyle = 'black';
    mouseContext.fillStyle = color;

    changes.push({layer: currentLayer, context: layers[currentLayer].toDataURL()});
    currentChange = 0;
    strokeContext.globalCompositeOperation = 'source-over';

    $('#color1').css({'background':color});
    $('#color2').css({'background':color2});

    loadCanvasFromStorage(layers[currentLayer]);


    $(window).unload(function() {
        saveCanvasToStorage(merge($('#background').get(0), layers));
    });

    $(document).bind('contextmenu', function(event) {
        event.preventDefault();
    });
}

function enableImports() {
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
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = reader.result;
                var img = new Image();
                img.src = data;
                img.onload = function () {
                    layers[currentLayer].getContext('2d').drawImage(img, evt.originalEvent.pageX, evt.originalEvent.pageX);
                }
            }
            reader.readAsDataURL(files[0]);
            evt.preventDefault();
            evt.stopPropagation();
        });
    }
}

var socket;

function isMobile() {
    return window.matchMedia('(min-device-width : 320px) and (max-device-width : 480px)').matches;
}

function prepareCanvas(canvas) {
    //TODO: In node version, set these to value from server
    $(canvas).css({'width':width, 'height':height});
    canvas.width = $('#mouse').width();
    canvas.height = $('#mouse').height();
}

//TODO: Remove temp function
function s(data) {
    socket.emit('stroke', {'stroke':data});
}

//Generates a unique 6 digit ID
function genID() {
    return ("000000" + (Math.random()*Math.pow(36,6) << 0).toString(36)).slice(-6);
}

//TODO: Error checking
function initOnline() {
    socket = io('168.235.67.12:8080');

    if (window.location.href.split('#').length == 1) {
        window.location.href = '#' + genID();
    }

    var url = window.location.href.split('#');
    if(url.length == 2) {
        roomId = url[1];

        socket.emit('ping', {
            'id': roomId
        }).on('pong', function(data) {
            online = true;
            if(data.exists) {
                socket.emit('join', {
                    'id': roomId
                });
            } else {
                socket.emit('create', {
                    'id': roomId,
                    'width': width,
                    'height': height
                });
            }
        });

        socket.on('beginStroke', function (data) {
            rStrokes[data.socket] = new Stroke('pencil', $('#layer0-remote').get(0), $('#layer0-remote-stroke').get(0));
            rStrokes[data.socket].begin(data.pos);
        });

        socket.on('updateStroke', function (data) {
            rStrokes[data.socket].update(data.pos);
        });

        socket.on('endStroke', function (data) {
            rStrokes[data.socket].end(data.pos);
        });
    }
}

$(document).ready(function() {
    width = $('body').css('width');
    height = $('body').css('height');
    if(isMobile()) {
        initMobileClient();
    } else {
        initDesktopClient();
    }
    initShared();

    $('#splash').fadeOut(1500);
    $('#window-holder').fadeIn(1500);
    if (window.location.href.split('#').length == 1) {
        window.location.href = '#' + genID();
    } else {
        initOnline();
    }
});