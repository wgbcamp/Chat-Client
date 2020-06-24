DROP DATABASE IF EXISTS user_nameDB;

CREATE DATABASE user_nameDB;

USE user_nameDB;

CREATE TABLE usernames (
    id INT NOT NULL AUTO_INCREMENT,
    socketID VARCHAR (50) NOT NULL,
    username VARCHAR (50) NOT NULL,
    PRIMARY KEY (id)
);

