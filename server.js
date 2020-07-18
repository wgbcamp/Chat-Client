require('dotenv').config();
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

var connection = mysql.createConnection({

    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
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
    var usernameTable = "DROP TABLE IF EXISTS usernames,anonymousUsers;CREATE TABLE usernames (id INT NOT NULL AUTO_INCREMENT, socketID VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, PRIMARY KEY(id));CREATE TABLE anonymousUsers (id INT NOT NULL AUTO_INCREMENT, socketID VARCHAR(50) NOT NULL, PRIMARY KEY(id))";
    connection.query(usernameTable, function (err, res){
        if (err) throw err;
        console.log("Username and anonymous tables created");
    });
});

var username = "";
var usernameCount = 0;
var connectedUsers;
var userCount;
var anonCount;

io.on('connection', function(socket){

    // HOLDS VALUE OF LAST SOCKET THAT PERFORMED AN ACTION
        const sessionID = socket.id;
        const slimmedID = sessionID.slice(sessionID.indexOf("#") + 1, sessionID.length);

        storeAnonymous(slimmedID);
        sendAnonCountToClient();

    //LOGS TO SERVER THAT A SOCKET HAS CONNECTED
    console.log('User ' + slimmedID + ' connected.');

    //DISPLAYS WHEN A USER HAS DISCONNECTED AND RELAYS TO CONNECTED CLIENTS IN CHAT ROOM
    socket.on('disconnect', () => {
        readUsername(slimmedID, leaveMessage);
        function leaveMessage(){
            io.emit('user disconnected', username + ' has left the chat.');
            console.log('User ' + username + '(' + slimmedID + ')' + ' disconnected.');
            }
        deleteUsername(slimmedID);
        deleteAnonymous(slimmedID);
        findAllUsers(displayUsers);
        function displayUsers(connectedUsers){
            io.emit('current users', connectedUsers)      
        }
        sendAnonCountToClient();
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
                    sendAnonCountToClient();
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
                username = `Anonymous user `;
            }else{
                username = JSON.parse(JSON.stringify(res[0].username));
                console.log(query.sql);
            }
            callback();
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

function sendAnonCountToClient(){
    countAnonymous();
    function countAnonymous(){
        var query = connection.query(
            "SELECT COUNT (socketid) FROM anonymousUsers",
            function(err, res){
                if(err) throw err;
                anonCount = JSON.parse(JSON.stringify(res[0]['COUNT (socketid)']));           
                countUsers();

                function countUsers(){
                    var query = connection.query(
                        "SELECT COUNT (socketid) FROM usernames",
                        function(err, res){
                            if(err) throw err;
                            userCount = JSON.parse(JSON.stringify(res[0]['COUNT (socketid)']));
                            io.emit('registered users', userCount);
                            io.emit('anonymous users', anonCount-userCount);      
                        }   
                    );
                }
            }
        );
    }
}

function storeAnonymous(slimmedID){
    var query = connection.query(
        "INSERT INTO anonymousUsers SET ?",
        {
            socketID: slimmedID
        },
        function(err, res){
            if(err) throw err;
        }
    );
    console.log(query.sql);
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

function deleteAnonymous(slimmedID){
    var query = connection.query(
        "DELETE FROM anonymousUsers WHERE ?",
        {
            socketID: slimmedID
        },
        function(err, res){
            if(err) throw err;
            console.log(query.sql);
        }
    );
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

http.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});