var AppWindow = function(rows, columns, title) {
    this.rows = rows;
    this.columns = columns;
    this.title = title;
    this.id = '#' + title + "Window";
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

    $(document).on('mousedown', "#" + this.title, function() {
        _this.isDragging = true;
    });

    $(document).on('mouseup', function() {
        _this.isDragging = false; 
    });

    $(document).on('mousemove', function(evt) {
        evt.preventDefault();
        document.getSelection().removeAllRanges();
        if(_this.isDragging) { 
            console.log(_this.id);
            $(_this.id).css({left: evt.pageX + "px"});
	        $(_this.id).css({top:  evt.pageY + "px"});
        }
    });
};

AppWindow.prototype.toHTML = function() {
    var html = '<table style="position:absolute" id=' + this.title + 'Window>' + 
        '<tr><th id="' + this.title  + '"colspan=' + this.columns + '>' + this.title + '</th></tr>';
    
    for(var i = 0; i < this.rows; i++) {
        html += '<tr>';
        for(var j = 0; j < this.columns; j++) {
            html += '<td>' + this.content[i][j]  + '</td>';
        }
        html += '</tr>';
    }
    html+= "</table>";

    return html;
}

AppWindow.prototype.toggle = function() {
    $(this.id).toggle();
}

AppWindow.prototype.addItem = function(row, column, html, id, onClick) {
    this.content[row][column] = html;
    $(document).on('click', '#' + id, onClick);
}


//TODO: Convert this into a sane class
var templates = {
    contextMenu: {
        header: "<div class='right-click'>" + "<ul>",
        html: "",
	    items: "",
        load: function() {
	        var _self = this; 
	        $(document).bind("contextmenu", function(event) {
                event.preventDefault();
                $("div.right-click").hide(100);
                $("div.right-click").remove();
                $(_self.html)
                    .appendTo("body")
                    .css({top:event.pageY + "px", left: event.pageX + "px"})
                    .hide(0);
                $("div.right-click").show(100);
		$(document).on("click", function(event) {
		    if($(event.target).attr("class") != "menu-item") {
			_self.close();
		    }
		});
	    	_self.onLoad();
	    });
        }, 
	onLoad: function() {

	},
	close: function() {
	    $(".right-click").remove();
	},
        onClose: function() {
	    
        },
        addEvent: function(id, content, onClick) {
            this.items += "<li class='menu-item' id='"+ id + "'>" + content + "</li>";
            this.html = this.header + this.items + "</ul></table"; 
            $(document).on("click", "#"+id,onClick);
        }
    }
}
