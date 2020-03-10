'use strict';

const postsHandler = require('./posts-handler');
const util = require('./handler-util');

function route(req, res) {
    if (process.env.DATABASE_URL && req.headers['x-forwarded-proto'] === 'http') {
        util.handleNotFound(req, res);
    }
    switch (req.url) {
        case '/':
            postsHandler.handle(req, res);
            break;
        case '/post':
            postsHandler.handlePost(req, res);
            break;
        case '/post/delete':
            postsHandler.handleDelete(req, res);
            break;
        case '/favicon.ico':
            util.handleFavicon(req, res);
            break;
        default:
            util.handleNotFound(req, res);
            break;
    }
}

module.exports = {
    route
};
