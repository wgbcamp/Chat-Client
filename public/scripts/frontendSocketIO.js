$(function () {



    var socket = io('localhost:3000/my-namespace');
    $('#usernameForm').submit(function(e){
      e.preventDefault();
      socket.emit('set username', $('#usernameInput').val());
      $('#usernameInput').val('');
      return false;
    });

    $('#messageForm').submit(function(e){
        e.preventDefault();
        socket.emit('chat message', $('#messageInput').val());
        $('#messageInput').val('');
        return false;
    });
    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
    socket.on('user connected', function(msg){
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('user disconnected', function(msg){
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('some event', function(msg){
        $('#messages').append($('<li>').text(msg));
    })
});