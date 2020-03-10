'use strict';

const http = require('http');
const router = require('./lib/router');

// const auth = require('http-auth');
// const file = './users.htpasswd';
// const realm = 'Enter username and password.';
// const basic = auth.basic({ realm: realm, file: file });
// const handleRequest = basic.check((req, res) => router.route(req, res));

const handleRequest = (req, res) => router.route(req, res);

const server = http.createServer(handleRequest)
    .on('error', (e) => {
        console.error('Server Error', e);
    })
    .on('clientError', (e) => {
        console.error('Client Error', e);
    });

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.info(`Listening on ${port}`);
});
