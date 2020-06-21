var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

//code executes when a connection is received from client

    
//custom namespace
const nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){


    //displays when a user has connected and relays to connected clients
    console.log('a user connected');
    io.of('/my-namespace').emit('user connected', 'A new user has joined the chat.');

    //displays when a user has disconnected and relays to connected clients
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.of('/my-namespace').emit('user disconnected', 'A user has left the chat.');
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        io.of('/my-namespace').emit('chat message', msg);
        console.log('message: ' + msg);
    });


    //practice with rooms
        socket.join('some room');
        io.of('/my-namespace').to('some room').emit('some event', 'if you get this message you are in the room');

});    





http.listen(3000, () => {
    console.log('listening on *:3000');
});