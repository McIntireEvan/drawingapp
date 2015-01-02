/*
 * A collection of generic methods to aid with canvas manipulation
 */

/*
 * Copies a list of layers onto a single layer
 *
 * @param {canvas} mergeTo - The layer to mergo onto
 * @param {array} mergeFrom - The list of canvases to merge together 
 */
function mergeCanvases(mergeTo, mergeFrom) {
    mergeContext = mergeTo.getContext('2d');
    for(var i = layers.length - 1;i>=0; i--) {
	    if($(layers[i]).is(":visible")) {
	        mergeContext.drawImage(mergeFrom[i], 0, 0);
	    }
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
    saveLayerToImage(canvas); 
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
