'use strict'
const divEscapedContentElement = (message) => {
   return $('<div></div>').text(message);
}

const divSystemContentElement = (message) => {
   return $('<div></div>').html('<i>' + message + '</i>');
}

const processUserInput = (chatApp, socket) => {
   var message = $('#send-message').val();
   var systemMessage;
   if(message.charAt(0) == '/'){
     systemMessage = chatApp.processCommand(message);
     if(systemMessage){
        $('#messages').append(divSystemContentElement(systemMessage));
     }
   }else{
     chatApp.sendMessage($('#room').text(), message);
     $('#messages').append(divEscapedContentElement(message));
     $('#messages').scrollTop($('#messages').prop('scrollHeight'));
   }
   $('#send-message').val('');
}

var socket = io.connect();
$(document).ready(() => {
  var chatApp = new Chat(socket);
  socket.on('nameResult', (result) => {
    var message;
    if(result.success){
      message = "you are now known as" + result.name + '.';    
    }else{
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', (result) => {
    $('#room').text(resul.room);
    $('#messages').append(divSystemContentElement('ROOM CHANGED'));
  });

  socket.on('message', (message) => {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', (rooms) => {
    $('#room-list').empty();
    for(var room in rooms){
      room = room.substring(1, room.length);
      if(room != ''){
        $('#room-list').append(divEscapedContentElement(room));
      }
    }
    $('#room-list div').click(() => {
      chatApp.processComand('/join' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(() => {
    socket.emit('rooms')
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(() => {
    processUserInput(chatApp, socket);
    return false;
  });
});