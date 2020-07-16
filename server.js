var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");
const { connected } = require('process');

var PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

var connection = ""

if (process.env.NODE_ENV === "production"){

var connection = mysql.createConnection({

    user: "root",
    password: "teMp7DhxIIasttrD",
    database: "usernameDB",
    socketPath: "/cloudsql/chatapp-283317:us-east4:chat-database",
    multipleStatements: true
});

}else{
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "usernameDB",
        multipleStatements: true
    });
}


connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    var usernameTable = "DROP TABLE IF EXISTS usernames;CREATE TABLE usernames (id INT NOT NULL AUTO_INCREMENT, socketID VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, PRIMARY KEY(id))";
    connection.query(usernameTable, function (err, res){
        if (err) throw err;
        console.log("Username table created");
    });
});

var username = "";
var usernameCount = 0;
var connectedUsers;
var clientCount = 0;

io.on('connection', function(socket){

    // HOLDS VALUE OF LAST SOCKET THAT PERFORMED AN ACTION
        const sessionID = socket.id;
        const slimmedID = sessionID.slice(sessionID.indexOf("#") + 1, sessionID.length);

    //LOGS TO SERVER THAT A SOCKET HAS CONNECTED
    console.log('User ' + slimmedID + ' connected.');
    clientCount++;
    io.emit('anonymous users', clientCount);

    //DISPLAYS WHEN A USER HAS DISCONNECTED AND RELAYS TO CONNECTED CLIENTS IN CHAT ROOM
    socket.on('disconnect', () => {

        readUsername(slimmedID, leaveMessage);
        function leaveMessage(){
            io.emit('user disconnected', username + ' has left the chat.');
            console.log('User ' + username + '(' + slimmedID + ')' + ' disconnected.');
            }
        deleteUsername(slimmedID);
        findAllUsers(displayUsers);
        function displayUsers(connectedUsers){
            io.emit('current users', connectedUsers)      
        }
        clientCount--;
        io.emit('anonymous users', clientCount);
    });

    //STORES USERNAME TO DATABASE, RELAYS NAME CHANGE TO ALL USERS IN CHAT ROOM
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
                        io.emit('chat message', "Anonymous user has set their nickname to " + "'" + username +"'.");
                        findAllUsers(displayUsers);
                        function displayUsers(connectedUsers){
                            io.emit('current users', connectedUsers)
                            
                        }
                }
            }else{
                io.emit('validation failure');
            }
        } 

    });

    //DISPLAYS CHAT MESSAGES SERVERSIDE AND RELAYS TO CONNECTED CLIENTS
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
            if ( JSON.parse(JSON.stringify(res)) == ""){
                username = `Anonymous user (${slimmedID})`;
            }else{
                username = JSON.parse(JSON.stringify(res[0].username));
                console.log(query.sql);
            }
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

function deleteUsername(slimmedID){
    var query = connection.query(
        "DELETE FROM usernames WHERE ?",
        {
            socketID: slimmedID
        },
        function(err, res){
            if(err) throw err;
            console.log(query.sql);
        }
    );
}

function findAllUsers(callback){
    var query = connection.query(
        "SELECT username FROM usernames",
        function(err, res){
            console.log(query.sql);
            connectedUsers = JSON.parse(JSON.stringify(res));
            console.log(connectedUsers);
            callback(connectedUsers);
        }
        
    );
}






http.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});