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

const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {success:true, name: name});
    namesUsed.push(name);
    return guestNumber + 1;
}

const joinRoom = (socket, room) => {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room: room});
    socket.broadcast.to(room).emit('message',{
        text: nickNames[socket.id] + 'has joined' + room +'.'
    });
    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){
        var usersInRoomSummary = 'users currently in' + room + ':';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index>0){
                  usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
            usersInRoomSummary += '.';
            socket.emit('message', {text: usersInRoomSummary});
        }
        

    }
}

const handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
   socket.on('nameAttempt', (name) => {
     if(name.indexOf('Guest') == 0){
        socket.emit('nameResult', {
            success: false,
            message: 'Names cannot begin with "Guest"'
        });
     }else{
         if(namesUsed.indexOf(name) == -1){
            var previousName = nickNames[socket.id];
            var previousNameIndex = namesUsed.indexOf(previousName);
            namesUsed.push(name);
            nickNames[socket.id] = name;
            delete namesUsed[previousNameIndex];
            socket.emit('nameResult', {success: true, name: name});
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                text: previousName + 'is now known as' + name + '.'
            });;
         }else{
             socket.emit('nameResult', {
                 success: false,
                 message: 'That name is already in use.'
             });
         }
     }
   });
}

const handleMessageBroadcasting = (socket) => {
      socket.on('message', (message) => {
        socket.broadcast.to(message.room).emit('message',{
            text: nickNames[socket.id] + ':' + message.text
        });
      });
}

const handleRoomJoinning = (socket) => {
   socket.on('join', (room) => {
      socket.leave(currentRoom[socket.id]);
      joinRoom(socket, room.newRoom);
   });
}

const handleClientDisconnection = (socket) => {
    socket.on('disconnect', () => {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}