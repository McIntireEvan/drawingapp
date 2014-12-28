var templates = {
    window: {
	dragging: false,
	isOpen: false, 
	id: "",
	pos: {
	    x: 0,
	    y: 0
	}, 
	header: "",
	headerID: "",
	html: "",
	content: "",
	open: function() {},
	close: function() {},
	beginRow: function() {
	    this.content += "<tr>";
	},
	endRow: function() {
	    this.content += "</tr>";
	}, 
	addElement: function(id, classes, colspan, content, onClick) {
	    this.content += "<td colspan='"+colspan+"' classes='" + classes + "' id='" + id + "'>" + content + "</td>";
	    this.html = "<table class='window' id=" + this.id + ">" + this.header + this.content + "</table>";
	    $(document).on('click',"#"+id, onClick); 

	}
    },
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
