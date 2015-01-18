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
	        if($(layers[i]).is(":visible")) {
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
 * @deprecated Use saveCanvasToImage() instead
 *
 * @param {canvas} canvas - The canvas to save
 */
function saveToImage(canvas) { 
    saveCanvasToImage(canvas); 
}

/*
 * Saves a canvas to an image and opens it in the browser
 *
 * @param {canvas} canvas - The canvas to save
 */
function saveCanvasToImage(canvas) {
    window.open(canvas.toDataURL(), '_blank');
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

