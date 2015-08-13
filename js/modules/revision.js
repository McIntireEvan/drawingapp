/* Canvas history */
//TODO: This could probably use another rewrite, it really sucks

function addChange() {
    currentChange++;

    if (currentChange != changes.length) {
        changes.splice(currentChange, changes.length - currentChange);
    }

    changes.push({ layer: currentLayer, context: layers[currentLayer].toDataURL() });
    console.log(currentChange);
}

function undo() {
    if (currentChange > 0) {
        currentChange--;
        updateCanvas();
        console.log(currentChange);
    } else { //Hack to allow undoing to blankness
        for (var i = 0; i < layers.length; i++) {
            clearCanvas(layers[i]);
        }
        clearCanvas($('#background').get(0));
        console.log(currentChange);
    }
}

function redo() {
    if (currentChange < changes.length - 1) {
        currentChange++;
        updateCanvas();
    }
}

function updateCanvas() {
    var newElement = changes[currentChange];
    var newLayer = layers[newElement.layer];
    clearCanvas(newLayer);

    var img = new Image();
    img.src = newElement.context;

    newLayer.getContext('2d').globalCompositeOperation = "source-over";
    newLayer.getContext('2d').globalAlpha = 1;
    newLayer.getContext('2d').drawImage(img, 0, 0);
    newLayer.getContext('2d').globalAlpha = currTool.opacity;

    layers[newElement.layer] = newLayer;
}