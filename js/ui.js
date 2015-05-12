var cursorInWindow = true;
var width = 0;
var height = 0;

function initDesktopClient() {
    $('#ToolboxWindow').windowfy({
        title: 'Toolbox',
        close: false,
        id: 'ToolboxHolder'
    }).on('click', '#brush', function (evt) {
        $('.selectedTool').removeClass('selectedTool');
        $('#brush, #pencil').addClass('selectedTool');
        currTool = pencil;
        mouseContext.fillStyle = color;
        $('#brushSettings').toggle();
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
            $('#ColorWindow').removeClass('cw1').parent().parent().hide();
            return;
        }
        if($('.cw2').length == 0) {
            $('#ColorWindow').addClass('cw1').removeClass('cw2').parent().parent().toggle();
        }
        $('#ColorWindow').html('').colorwheel({size: 200, ringSize: 20, onInput: function(evt) {
            var newColor = evt.color;
            color1 = 'rgb(' + newColor.r + ',' + newColor.g + ',' + newColor.b + ')';
            $('#color1').css('background',color1);
        }});
    }).on('click', '#color2', function () {
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
        $('#AboutWindow').parent().parent().toggle();
    }).on('click', '#helptoggle', function () {
        $('#HelpWindow').parent().parent().toggle();
    }).on('click', '#invite', function() {
        initOnline();
        alert('Online activated: Invite people with the URL ' + window.location.href);
    }).on('click', '#settings', function() {
        $('#SettingsWindow').parent().parent().toggle();
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
        id: 'Layers',
        x: 100
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
        currTool.opacity = ($(this).val()/ 100);
        $(mouseLayer).css('opacity', currTool.opacity);
    });

    $('#brush-size').on('input', function () {
        $('#brush-size-value').html($(this).val());
        currTool.radius = $(this).val();
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

    $('#SettingsWindow').windowfy({
        title: 'Settings',
        onClose: function () {
            $(this).hide();
        },
        id: 'settingsW'
    }).parent().parent().hide();

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

    bindKeys();

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
            $('#brush').addClass('selectedTool');
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
            createText(string, currTool.font, { x: pos.x, y: pos.y }, layers[currentLayer]);
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

function bindKeys() {
    var KeyBinding = function(name, key, shift, alt, ctrl, onPress) {
        this.name = name;
        this.onPress = onPress;

        if(localStorage.getItem(name) == null) {
            this.key = key;
            this.shift = shift;
            this.alt = alt;
            this.ctrl = ctrl;
            localStorage.setItem(name, JSON.stringify(this));
        } else {
            var obj = JSON.parse(localStorage.getItem(name));
            this.key = obj.key;
            this.shift = obj.shift;
            this.alt = obj.alt;
            this.ctrl = obj.ctrl;
        }
    }

    KeyBinding.prototype.call = function(evt) {
        this.onPress(evt);
    }

    var bindings = [
        new KeyBinding('switchColor', 88, false, false, false, function() {
            var temp = color1;
            color1 = color2;
            color2 = temp;
            color = color1;
            $('#color1').css({'background':color});
            $('#color2').css({'background':color2});
        }),
        new KeyBinding('finishLayerRename', 13, false, false, false, function() {
            $('#newName').trigger('blur');
        }),
        new KeyBinding('sizeUp', 187, false, false, false, function() {
            currTool.radius++;
        }),
        new KeyBinding('sizeDown', 189, false, false, false, function() {
            if ( currTool.radius > 1 ) {
                currTool.radius--;
            }
        }),
        new KeyBinding('opacityUp', 187, true, false, false, function() {
            if ( currTool.opacity < 1.0 ) {
                currTool.opacity += 0.01;
            }
            $(mouseLayer).css('opacity', currTool.opacity);
            var o = Math.round(currTool.opacity * 100);
            $('#brush-opacity-value').html(o);
            $('#brush-opacity').val(o);
        }),
        new KeyBinding('opacityDown', 189, true, false, false, function() {
            if(currTool.opacity > 0) {
                currTool.opacity -= 0.01;
            }
            $(mouseLayer).css('opacity', currTool.opacity);
            var o = Math.round(currTool.opacity * 100);
            $('#brush-opacity-value').html(o);
            $('#brush-opacity').val(o);

        }),
        new KeyBinding('save', 83, false, false, true, function(evt) {
            evt.preventDefault();
            saveCanvasToImage(merge($('#background').get(0), layers));
            clearCanvas($('#background').get(0));
        }),
        new KeyBinding('undo', 90, false, false, true, function() {
            undo();
        }),
        new KeyBinding('redo', 89, false, false, true, function() {
            redo();
        })
    ];

    $(document).keydown(function(evt) {
        if(mouseDown) return;

        for(var i = 0; i < bindings.length; i++) {
            var keybind = bindings[i];
            if((evt.which == keybind.key)
             &&(evt.shiftKey == keybind.shift)
             &&(evt.ctrlKey == keybind.ctrl)
             &&(evt.altKey == keybind.alt)) {
                keybind.call(evt);
            }
        }
        $('#brush-size-value').html(currTool.radius);
        $('#brush-size').val(currTool.radius);
        drawCursor(pos);
    });

    $('#Keybinds input').on('keyup', function(evt) {
        if(!(evt.which == 16 || evt.which == 17 || evt.which == 18)) {
            var name = this.id.replace('keybind-', '');
            for(var i = 0; i < bindings.length; i++) {
                if(name == bindings[i].name) {
                    bindings[i].key = evt.which;
                    bindings[i].ctrl = evt.ctrlKey;
                    bindings[i].shift = evt.shiftKey;
                    bindings[i].alt = evt.altKey;
                }
            }
        }
    });
}

function setIconSize() {
    var size = localStorage.getItem('iconSize');
    $('.windowfy img').css({
        'width': size,
        'height': size
    });
}

function initMobileClient() {
    $(document).on('touchstart', function (evt) {
        stroke = new Stroke(currTool, layers[currentLayer], strokeLayer);
        stroke.begin({ 'x': evt.originalEvent.changedTouches[0].pageX, 'y': evt.originalEvent.changedTouches[0].pageY });
        mouseDown = true;
    }).on('touchmove', function (evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.touches[0]);
        evt.preventDefault();
        if (mouseDown) {
            stroke.update(pos);
        }
    }).on('touchend', function (evt) {
        pos = getMousePos(mouseLayer, evt.originalEvent.changedTouches[0]);
        if (mouseDown) {
            stroke.end(pos);
        }
    }).on('change', '.colorpick', function () {
        color = $('.colorpick').val();
        color1 = color;
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

    $("<div/>").attr({
        'class': 'mobile-toolbox'
    }).appendTo('body');

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Pencil').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('selected');
        $(this).addClass('selected');

        currTool = pencil;
    });

    $("<div/>").attr({
        'class': 'toolbox-item'
    }).html('Eraser').appendTo('.mobile-toolbox').click(function () {
        $('.selected').removeClass('selected');
        $(this).addClass('selected');

        currTool = eraser;
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
    $('#window-holder').remove();
}

function initShared() {
    initCanvases();
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
    prepareCanvas($('#layer0-remote').get(0));
    prepareCanvas($('#layer0-remote-stroke').get(0));
    prepareCanvas(strokeLayer);
}

//TODO: Cleanup
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
        Console.log('Error attaching drop and paste events');
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
    if(isMobile()) {
        initMobileClient();
    } else {
        initDesktopClient();
    }
    initShared();
    bindImports();
    $('#splash').fadeOut(1500);
    $('#window-holder').fadeIn(1500);
    if (window.location.href.split('#').length != 1) {
        initOnline();
    }
});
