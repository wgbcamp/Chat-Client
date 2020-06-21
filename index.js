var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

//code executes when a connection is received from client
io.on('connection', (socket) => {
    
    //displays when a user has connected
    console.log('a user connected');

    //displays when a user has disconnected
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});