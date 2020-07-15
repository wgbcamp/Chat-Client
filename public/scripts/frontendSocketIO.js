$(function () {

    var socket = io();

    $('#usernameCreateForm').submit(function(e){
        e.preventDefault();
        socket.emit('set username', $('#usernameCreate').val());
        $('#usernameCreate').val('');
        return false;
    });

    socket.on('close modal', function(){
        modal.style.display = "none";
    });

    socket.on('validation failure', function(){
        $("p").html("Give yourself a unique nickname that's between 1 to 30 characters.");
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

// Get the modal
var modal = document.getElementById("myModal");

// modal opens on page load
$(document).ready(function() {
  modal.style.display = "block";
});