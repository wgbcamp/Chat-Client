var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

//code executes when a connection is received from client
io.on('connection', (socket) => {
    
    //displays when a user has connected and relays to connected clients
    console.log('a user connected');
    io.emit('user connected', 'A new user has joined the chat.');

    //displays when a user has disconnected and relays to connected clients
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('user disconnected', 'A user has left the chat.');
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
    });

    //custom namespace
    const nsp = io.of('/my-namespace');
    nsp.on('connection', function(socket){
        console.log('someone connected');
    });

});

http.listen(3000, () => {
    console.log('listening on *:3000');
});