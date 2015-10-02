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
    currTool.color = color;
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