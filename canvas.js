function mergeLayers(masterLayer, layers) {
    masterContext = masterLayer.getContext('2d');
    for(var i = layers.length - 1;i>=0; i--) {
	if($(layers[i]).is(":visible")) {
	    masterContext.drawImage(layers[i], 0, 0);
	}
    }
    return masterLayer;
}

function clearCanvas(c) { clearLayer(c); }

function clearLayer(layer) {
    layer.getContext('2d').clearRect(0,0, layer.width, layer.height);
}

function saveToImage(canvas) { saveLayerToImage(canvas); }

function saveLayerToImage(canvas) {
    window.open(canvas.toDataURL(), '_blank');
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
	x: (evt.clientX - rect.left)/(rect.right-rect.left)*canvas.width,
	y: (evt.clientY - rect.top)/(rect.bottom-rect.top)*canvas.height
    };
}

function drawCursor(canvas, context, pos, color, radius){
    context.clearRect(0,0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    if(tool == "pencil") {
	context.fillStyle=color;
    } else if (tool == "eraser") {
	context.fillStyle="rgba(0,0,0,0)";
    }
    context.fill();
    context.stroke();
}
