'use strict';

const fs = require('fs');

function handleRedirectPosts(req, res) {
    res.writeHead(303, { 'Location': '/' });
    res.end();
}

function handleNotFound(req, res) {
    // res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    // res.end('ページがみつかりません');
    handleRedirectPosts(req, res);
}

function handleBadRequest(req, res) {
    // res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    // res.end('未対応のリクエストです');
    handleRedirectPosts(req, res);
}

function handleFavicon(req, res) {
    res.writeHead(200, { 'Content-Type': 'image/vnd.microsoft.icon' });
    const favicon = fs.readFileSync('./favicon.ico');
    res.end(favicon);
}

module.exports = {
    handleRedirectPosts,
    handleNotFound,
    handleBadRequest,
    handleFavicon
};
