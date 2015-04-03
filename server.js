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

    socket.on('stroke', function(data) {
        io.to(room).emit('stroke', {'stroke': data.stroke});
    });

    socket.on('beginStroke', function(data) {
        io.to(room).emit('stroke', {'stroke': data.stroke});
    });

    socket.on('updateStroke', function(data) {
        io.to(room).emit('stroke', {'stroke': data.stroke});
    });

    socket.on('endStroke', function(data) {
        io.to(room).emit('stroke', {'stroke': data.stroke});
    });

});
