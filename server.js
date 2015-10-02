var io = require('socket.io').listen(8080);
var rooms = [];
var meta = {};

io.on('connection', function(socket) {
    var room;
    socket.on('handshake', function(data) {
        var exists = rooms.indexOf(data.id) != -1;
        if(exists) {
            socket.emit('handshake', {
                'exists': true,
                width: meta[data.id].width,
                height: meta[data.id].height
            });
        } else {
            socket.emit('handshake', {
                'exists': false,
            });
        }
    });

    socket.on('create', function(data) {
        console.log('Init room ' + data.id);
        rooms.push(data.id);
        socket.join(data.id);
        room = data.id;
        meta[data.id] = {
            'width': data.width,
            'height': data.height,
            'users': 1
        };
    });

    socket.on('join', function(data) {
        console.log('Client joined room ' + data.id)
        socket.join(data.id);
        room = data.id;
        meta[data.id] += 1;
    });

    socket.on('beginStroke', function(data) {
        socket.broadcast.to(room).emit('beginStroke', { 'pos': data.pos, 'socket':socket.id, 'tool': data.tool });
    });

    socket.on('updateStroke', function(data) {
        socket.broadcast.to(room).emit('updateStroke', { 'pos': data.pos, 'socket': socket.id });
    });

    socket.on('endStroke', function(data) {
        socket.broadcast.to(room).emit('endStroke', { 'pos': data.pos, 'socket': socket.id });
    });

    socket.on('drawLine', function (data) {
        socket.broadcast.to(room).emit('drawLine', { 'start': data.start, 'end': draw.end, 'socket': socket.id });
        console.log('drawline');
    });

    socket.on('text', function(data) {
        socket.broadcast.to(room).emit('text', { 'pos': data.pos, 'socket':socket.id, 'tool': data.tool, text: data.text });
    });

    socket.on('disconnect', function(data) {
        meta[room]['users'] -= 1;
        if(meta[room]['users'] == 0) {
           setTimeout(deleteRoom, 1000 * 3 * 60, room);
        }
    });
});

function deleteRoom(id) {
    rooms.splice(rooms.indexOf(id), 1);
    console.log('Deleted room ' + id)
    delete meta[id];
}
