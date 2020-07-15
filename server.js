var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");

var PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

var connection = ""

if (process.env.NODE_ENV === "production"){

    connection = mysql.createConnection({
        host: "34.86.52.45",
        port: 3306,
        user: "root",
        password: "teMp7DhxIIasttrD",
        database: "usernameDB" 
    });

}else{
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "user_nameDB" 
    });
}


connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
});

var username = "";
var usernameCount = 0;

//code executes when a connection is received from client
//custom namespace
// const nsp = io.of('/my-namespace');

io.on('connection', function(socket){

    //holds value of last socket that performed an action
        const sessionID = socket.id;
        const slimmedID = sessionID.slice(sessionID.indexOf("#") + 1, sessionID.length);

    //logs to server that a socket has connected
    console.log('User ' + slimmedID + ' connected.');

    //displays when a user has disconnected and relays to connected clients in chat room
    socket.on('disconnect', () => {
        if(username == ""){
            
        }else{

        readUsername(slimmedID, leaveMessage);
        function leaveMessage(){
            io.emit('user disconnected', username + ' has left the chat.');
            console.log('User ' + username + '(' + slimmedID + ')' + ' disconnected.');
            }
        }
    });

    //stores username to database, adds user to the chat room, relays join message to all users in chat room
    socket.on('set username', (msg) => {
        console.log('User ' + slimmedID + ' requested to set their username to: ' + msg);
        
        checkForExistingUsername(msg, usernameValidation);

        function usernameValidation(){

            if(msg.length > 0 && msg.length < 30 && usernameCount == 0){
            
                storeUsername(slimmedID, msg);
    
                console.log('User ' + slimmedID + ' has set their username to: ' + msg);

                io.emit('close modal');

    
                readUsername(slimmedID, joinMessage);
                    function joinMessage(){
                        io.emit('chat message', username + " has joined the chat room.");
                }
            }else{
                io.emit('validation failure');
            }
        } 
    });

    //displays chat messages serverside and relays to connected clients
    socket.on('chat message', (msg) => {
        if(username == ""){

        }else{

        readUsername(slimmedID, emitMessage);
        function emitMessage(){
            io.emit('chat message', username + ": " + msg);
            console.log(username + '(' + slimmedID + ')' + ": " + msg); 
            }
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
            try {
                username = JSON.parse(JSON.stringify(res[0].username));
            }
            catch (err){
            }
            console.log(query.sql);
            callback();
        }
    );

}

function checkForExistingUsername(msg, callback){
    var query = connection.query(
        "SELECT COUNT (username) FROM usernames WHERE ?",
        {
            username: msg
        },
        function (err, res){
            if (err) throw err;
            console.log(query.sql);
            usernameCount = JSON.parse(JSON.stringify(res[0]['COUNT (username)']));
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


http.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});