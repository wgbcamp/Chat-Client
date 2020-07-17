$(function () {


    var autoScroll;
    var chatScroll = document.getElementById("decorateMessages");

    function checkScrollHeight(){
        if(chatScroll.scrollTop >= (chatScroll.scrollHeight - chatScroll.offsetHeight)) {
            autoScroll = 'true';
       }else{
            autoScroll = 'false';
       }
    }
    
    function useAutoScroll(){
        if(autoScroll == 'true'){
            chatScroll.scrollTop = chatScroll.scrollHeight;
        }
    }

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
        checkScrollHeight();
        $('#messages').append($('<li>').text(msg));
        useAutoScroll();
    });

    socket.on('current users', function(msg){
        $("#currentUserList").empty();
        for(i=0; i<msg.length; i++){  
            $('#currentUserList').append('<li>' + msg[i].username)      
        }
    })

    socket.on('registered users', function(msg){
        $("#currentUsers").text("Users in chat room: " + (msg));
    })

    socket.on('anonymous users', function(msg){
        console.log(document.getElementById("currentUserList").getElementsByTagName("li").length);
        $("#anonymousUserList").text("Users in waiting room: " + (msg));
    })


    socket.on('user disconnected', function(msg){
        checkScrollHeight();
        $('#messages').append($('<li>').text(msg));
        useAutoScroll();
    });
});

// Get the modal
var modal = document.getElementById("myModal");

// modal opens on page load
$(document).ready(function() {
  modal.style.display = "block";
});

