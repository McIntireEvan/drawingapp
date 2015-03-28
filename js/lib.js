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
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
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
    try {
        if (localStorage.getItem('canvas')) {
            var img = new Image;
            img.src = localStorage.getItem('canvas');
            destination.getContext('2d').drawImage(img, 0, 0);
            localStorage.removeItem('canvas');
        }
    } catch (e) {}
}

function textTool(font, evt, ctx) {
    var string = prompt('Text:');
    if (string == 'null' || string == '' || string == null) {
        return;
    }
    if(evt.which == 3) {
        color = color2;
    } else if (evt.which == 1) {
        color = color1;
    }
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(string, evt.pageX, evt.pageY);
    changes.push({ layer: currentLayer, context: layers[currentLayer].toDataURL() });
}

function importImages() {
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

function isMobile() {
    return 'ontouchstart' in window;
}
