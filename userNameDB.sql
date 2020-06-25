DROP DATABASE IF EXISTS x4gkipl2yvmskf7y;

CREATE DATABASE x4gkipl2yvmskf7y;

USE x4gkipl2yvmskf7y;

CREATE TABLE usernames (
    id INT NOT NULL AUTO_INCREMENT,
    socketID VARCHAR (50) NOT NULL,
    username VARCHAR (50) NOT NULL,
    PRIMARY KEY (id)
);

