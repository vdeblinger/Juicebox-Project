require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const PORT = 3000;
const server = express();
const { client } = require('./db');


const apiRouter = require('./API');
// server.use('/api', apiRouter);

server.use(morgan('dev'));
server.use(express.json());
server.use(express.urlencoded( { extended: false } ));
server.use((req,res,next) => {
    console.log("starting body");
    console.log(req.body);
    console.log("ending body");
    next();
});

server.get('/background/:color', (req, res, next) => {
    res.send(`
    <body style="background: ${ req.params.color };">
        <h1>Hello World</h1>
    </body>
    `);
});

server.get('/add/:first/to/:second', (req, res, next) => {
    res.send(`<h1>${ req.params.first } + ${ req.params.second } = ${
    Number(req.params.first) + Number(req.params.second)
    }</h1>`);
});

server.use('/api', apiRouter);
// const { client } = require('./db');


client.connect();
server.listen(PORT, () => {
    console.log(`The server is up on port: ${PORT}`);
});

module.exports = {

    client,
    jwt,
    bcrypt
}