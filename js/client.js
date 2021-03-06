/* Handles all clientside networking */

var socket;
var roomId;
var online = false;
var rStrokes = {};

//Generates a unique 6 digit ID
function genID() {
    return ("000000" + (Math.random()*Math.pow(36,6) << 0).toString(36)).slice(-6);
}

//TODO: Error checking
function initOnline() {
    //Todo: Replace hardcoded address
    socket = io('skynet.evanmcintire.com:8080');

    if (window.location.href.split('#').length == 1) {
        window.location.href = '#' + genID();
    }

    var url = window.location.href.split('#');
    if(url.length == 2) {
        roomId = url[1];

        socket.emit('handshake', {
            'id': roomId
        }).on('handshake', function(data) {
            online = true;
            if(data.exists) {
                socket.emit('join', {
                    'id': roomId
                });
                width = data.width;
                height = data.height;
                initCanvases();
            } else {
                socket.emit('create', {
                    'id': roomId,
                    'width': width,
                    'height': height
                });
            }
        });

        socket.on('beginStroke', function (data) {
            rStrokes[data.socket] = new Stroke(data.tool, $('#layer0').get(0), $('#layer0-remote-stroke').get(0));
            rStrokes[data.socket].begin(data.pos);
        });

        socket.on('updateStroke', function (data) {
            rStrokes[data.socket].update(data.pos);
        });

        socket.on('endStroke', function (data) {
            rStrokes[data.socket].end(data.pos);
        });

        socket.on('text', function(data) {
            createText(data.text, data.tool, { x: data.pos.x, y: data.pos.y }, $('#layer0').get(0));
        });

        socket.on('drawLine', function (data) {
            console.log('dsfhgjsdigjoij');
            drawLine($('#layer0').getContext('2d'), data.start, data.end);
        });
    }
}
