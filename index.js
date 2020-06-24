var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });


//create mysql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "user_nameDB" 
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
});


//code executes when a connection is received from client
//custom namespace
const nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){

    //holds value of last socket that performed an action
        const sessionID = socket.id;
        const slimmedID = sessionID.slice(sessionID.indexOf("#") + 1, sessionID.length);

    //displays when a user has connected and relays to connected clients
    console.log('User ' + slimmedID + ' connected.');
    io.of('/my-namespace').emit('user connected', 'User ' + slimmedID + ' has joined the chat.');

    //displays when a user has disconnected and relays to connected clients
    socket.on('disconnect', () => {
        console.log('User ' + slimmedID + ' disconnected.');
        io.of('/my-namespace').emit('user disconnected', 'User ' + slimmedID + ' has left the chat.');
    });

    //stores username to database
    socket.on('set username', (msg) => {
        console.log('User ' + slimmedID + ' has set their username to: ' + msg);
        storeUsername(slimmedID, msg);
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        io.of('/my-namespace').emit('chat message', slimmedID + ": " + msg);
        console.log(slimmedID + ": " + msg);
    });


    //practice with rooms
        socket.join('some room');
        io.of('/my-namespace').to('some room').emit('some event', 'if you get this message you are in the room');

});    


function storeUsername(slimmedID, msg){
    var query = connection.query(
        "INSERT INTO usernames SET ?",
        {
            socketID: slimmedID,
            username: msg
        },
        function(err, res){
            if(err) throw err;
        }
    );
    console.log(query.sql);
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});