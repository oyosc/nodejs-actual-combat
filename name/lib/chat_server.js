var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};
exports.listen = (server) => {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', (socket) => {
       guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
       joinRoom(socket, 'Lobby');
       handleMessageBroadcasting(socket, nickNames);
       handleNameChangeAttempts(socket, nickNames, namesUsed);
       handleRoomJoinning(socket);
       socket.on('rooms', () => {
           socket.emit('rooms', io.sockets.manager.rooms);
       });
       handleClientDisconnection(socket, nickNames, namesUsed);
    });
}

const assignGuestName = (socket, guestNumber,) => {
    
}