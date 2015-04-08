var io = require('socket.io').listen(8080);
var rooms = [];

io.on('connection', function(socket) {
    var room;
    socket.on('ping', function(data) {
        var exists = rooms.indexOf(data.id) != -1;
        socket.emit('pong', {
            'exists': exists
        });
    });

    socket.on('create', function(data) {
        console.log(data);
        rooms.push(data.id);
        socket.join(data.id);
        room = data.id;
    });

    socket.on('join', function(data) {
        console.log('client joined room ' + data.id)
        socket.join(data.id);
        room = data.id;
        socket.broadcast.to(room).emit('msg', {'msg': 'NEW CLIENT'});
    });

    socket.on('beginStroke', function(data) {
        socket.broadcast.to(room).emit('beginStroke', { 'pos': data.pos, 'socket':socket.id });
    });

    socket.on('updateStroke', function(data) {
        socket.broadcast.to(room).emit('updateStroke', { 'pos': data.pos, 'socket': socket.id });
    });

    socket.on('endStroke', function(data) {
        socket.broadcast.to(room).emit('endStroke', { 'pos': data.pos, 'socket': socket.id });
    });
});
