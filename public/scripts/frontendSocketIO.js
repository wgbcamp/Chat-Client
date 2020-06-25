$(function () {

    var socket = io('localhost:3000/my-namespace');

    $('#usernameCreateForm').submit(function(e){
        e.preventDefault();
        socket.emit('set username', $('#usernameCreate').val());
        $('#usernameCreate').val('');
        return false;
    });

    socket.on('close modal', function(){
        modal.style.display = "none";
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

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}