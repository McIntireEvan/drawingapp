var AppWindow = function(rows, columns, title) {
    this.rows = rows;
    this.columns = columns;
    this.title = title;
    this.id = '#' + title + 'Window';
    this.isDragging = false;
    var content = [];
    for(var i = 0; i < rows; i++) {
        content[i] = [];
        for(var j = 0; j < columns; j++) {
            content[i][j] = '';
        }
    }
    this.content = content;
    var _this = this;

    $(document).on('mousedown', '#' + this.title, function(evt) {
        _this.isDragging = true;
        _this.offsetX = evt.pageX - $(_this.id).offset().left;
        _this.offsetY = evt.pageY - $(_this.id).offset().top;;
    });

    $(document).on('mouseup', function() {
        _this.isDragging = false; 
    });

    $(document).on('mousemove', function(evt) {
        evt.preventDefault();
        document.getSelection().removeAllRanges();
        if(_this.isDragging) {
            $(_this.id).css({left: (evt.pageX - _this.offsetX) + 'px'});
	        $(_this.id).css({top:  (evt.pageY - _this.offsetY) + 'px'});
        }
    });
};

AppWindow.prototype.toHTML = function() {
    var html = '<table class="AppWindow" id="' + this.title + 'Window">' +
        '<tr><th class="windowTitle" id="' + this.title  + '" colspan=' + this.columns + '>' + this.title + '</th></tr>';

    for(var i = 0; i < this.rows; i++) {
        html += '<tr>';
        for(var j = 0; j < this.columns; j++) {
            html += this.content[i][j];
        }
        html += '</tr>';
    }
    html+= '</table>';

    return html;
}

AppWindow.prototype.toggle = function() {
    $(this.id).toggle();
}

AppWindow.prototype.addItem = function(row, column, html, id, onClick) {
    this.content[row][column] = '<td id="' + id + '" class="AppWindowItem">' + html + '</td>';
    $(document).on('click', '#' + id, onClick);
}

AppWindow.prototype.addDisplayItem = function(row, column, html) {
    this.content[row][column] = '<td class="AppWindowItem">' + html + '</td>';
}

AppWindow.prototype.addRow = function() {
    this.content[this.rows] = [];
    for(var j = 0; j < this.columns; j++) {
        this.content[this.rows][j] = '';
    }
    this.rows++;
}

AppWindow.prototype.removeRow = function(row) {
    this.rows--;
    this.content.splice(row, 1);
}

AppWindow.prototype.setPos = function(x, y) {
    $('#' + this.title + 'Window').css({left: x,top: y});
}

AppWindow.prototype.appendToBody = function(show, x, y) {
    $('body').append(this.toHTML());
    this.setPos(x, y);
    if(!show) {
        this.toggle();
    }
}

AppWindow.prototype.getRows = function() {
    return this.rows;
}

AppWindow.prototype.update = function() {
    $('#' + this.title + 'Window').html(this.toHTML());
}

/*
 * A collection of generic methods to aid with canvas manipulation
 */

/*
 * Copies a canvas onto another canvas
 *
 * @param {canvas} mergeTo - The layer to mergo onto
 * @param {array} mergeFrom - The canvas to merge from 
 */
function merge(mergeTo, mergeFrom) {
    mergeContext = mergeTo.getContext('2d');
    if(mergeFrom instanceof HTMLCanvasElement) {
        mergeContext.drawImage(mergeFrom, 0, 0);
    } else if (mergeFrom instanceof Array) {
        for(var i = layers.length - 1;i>=0; i--) {
	        if($(layers[i]).is(':visible')) {
	            mergeContext.drawImage(mergeFrom[i], 0, 0);
	        }
        }
    } else {
        console.log('Error merging layers');
    }
    return mergeTo;
}

/*
 * Clears a canvas
 * @param {canvas} canvas - The canvas to be cleared
 */
function clearCanvas(canvas) { 
    canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
}

/*
 * Saves a canvas to an image and opens it in the browser
 *
 * @param {canvas} canvas - The canvas to save
 */
function saveCanvasToImage(canvas) {
    var filename = prompt('File name:');
    if(!(filename == '') && !(filename == null)) {
        $('<a href="' + canvas.toDataURL() + '" download="' + filename + '"></a>')[0].click();
    }
}

/*
 * Gets the current mouse position relative to the top left corner of the canvas
 *
 * @param {canvas} canvas - The canvas that the position should be relative to
 * @param {event} evt - The mouse event used to get the new mouse position
 */
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
	    x: (evt.clientX - rect.left)/(rect.right-rect.left)*canvas.width,
	    y: (evt.clientY - rect.top)/(rect.bottom-rect.top)*canvas.height
    };
}

function saveCanvasToStorage(source) {
   localStorage.setItem('canvas', source.toDataURL());
}

function loadCanvasFromStorage(destination) {
    if(localStorage.getItem('canvas')) {
        var img = new Image;
        img.src = localStorage.getItem('canvas');
        destination.getContext('2d').drawImage(img, 0, 0);
    }
}

function isMobile() {
    return window.matchMedia("only screen" +
            " and (min-device-width: 320px)" +
            " and (max-device-width: 480px)").matches;
}
