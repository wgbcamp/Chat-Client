var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");

app.use(express.static('public'));

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

var username;

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
        readUsername(slimmedID, leaveMessage);
        function leaveMessage(){
            io.of('/my-namespace').emit('user disconnected', username + ' has left the chat.');
            console.log('User ' + username + '(' + slimmedID + ')' + ' disconnected.');
        }
    });

    //stores username to database
    socket.on('set username', (msg) => {
        console.log('User ' + slimmedID + ' has set their username to: ' + msg);
        storeUsername(slimmedID, msg);

        socket.join('some room');
        io.of('/my-namespace').to('some room').emit('some event', 'if you get this message you are in the room');
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        readUsername(slimmedID, emitMessage);
        function emitMessage(){
            io.of('/my-namespace').emit('chat message', username + ": " + msg);
            console.log(username + '(' + slimmedID + ')' + ": " + msg); 
        }
    });

});    


    function readUsername(slimmedID, callback){
    var query = connection.query(
        "SELECT username FROM usernames WHERE ?",
        {
            socketID: slimmedID
        },
        function(err, res){
            if (err) throw err;
            username = JSON.parse(JSON.stringify(res[0].username));
            console.log(query.sql);
            callback();
        }
    );

}



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