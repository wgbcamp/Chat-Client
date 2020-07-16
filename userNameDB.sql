DROP DATABASE IF EXISTS usernameDB;

CREATE DATABASE usernameDB;

USE usernameDB;

CREATE TABLE usernames (
    id INT NOT NULL AUTO_INCREMENT,
    socketID VARCHAR (50) NOT NULL,
    username VARCHAR (50) NOT NULL,
    PRIMARY KEY (id)
);

