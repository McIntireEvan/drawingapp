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

AppWindow.prototype.addRow = function() {
    for(var j = 0; j < this.columns; j++) {
        this.content[rows][j] = '';
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
