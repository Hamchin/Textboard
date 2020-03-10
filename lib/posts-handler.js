'use strict';

const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const moment = require('moment-timezone');
const util = require('./handler-util');
const Post = require('./post');

const trackingIdKey = 'tracking_id';
// {トラッキングID: トークン}
const oneTimeTokenMap = new Map();

function handle(req, res) {
    const cookies = new Cookies(req, res);
    const trackingId = addTrackingCookie(cookies);
    switch (req.method) {
        case 'GET':
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
                posts.forEach((post) => {
                    post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
                });
                const oneTimeToken = crypto.randomBytes(8).toString('hex');
                oneTimeTokenMap.set(trackingId, oneTimeToken);
                res.end(pug.renderFile('./views/posts.pug', {
                    posts: posts,
                    oneTimeToken: oneTimeToken,
                    trackingId: trackingId
                }));
                console.info(
                    `[View Posts] trackingId: "${trackingId}", ` +
                    `remoteAddress: "${req.connection.remoteAddress}", ` +
                    `userAgent: "${req.headers['user-agent']}"`
                );
            });
            break;
        default:
            util.handleBadRequest(req, res);
            break;
    }
}

function handlePost(req, res) {
    const cookies = new Cookies(req, res);
    const trackingId = addTrackingCookie(cookies);
    switch (req.method) {
        case 'POST':
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                const decoded = decodeURIComponent(body.replace(/\+/g, ' '));
                const dataArray = decoded.split('&');
                const content = dataArray[0] ? dataArray[0].split('content=')[1] : '';
                const requestedOneTimeToken = dataArray[1] ? dataArray[1].split('oneTimeToken=')[1] : '';
                if (oneTimeTokenMap.get(trackingId) === requestedOneTimeToken) {
                    console.info(
                        `[Send Post] content: "${content}", ` +
                        `remoteAddress: "${req.connection.remoteAddress}", ` +
                        `userAgent: "${req.headers['user-agent']}"`
                    );
                    Post.create({
                        content: content,
                        trackingCookie: trackingId
                    }).then(() => {
                        util.handleRedirectPosts(req, res);
                    });
                }
                else {
                    util.handleBadRequest(req, res);
                }
            });
            break;
        default:
            util.handleBadRequest(req, res);
            break;
    }
}

function handleDelete(req, res) {
    const cookies = new Cookies(req, res);
    const trackingId = addTrackingCookie(cookies);
    switch (req.method) {
        case 'POST':
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                const decoded = decodeURIComponent(body);
                const dataArray = decoded.split('&');
                const id = dataArray[0] ? dataArray[0].split('id=')[1] : '';
                const requestedOneTimeToken = dataArray[1] ? dataArray[1].split('oneTimeToken=')[1] : '';
                if (oneTimeTokenMap.get(trackingId) === requestedOneTimeToken) {
                    Post.findByPk(id).then((post) => {
                        // if (!(req.user === post.postedBy || req.user === 'admin')) return;
                        const content = post.content;
                        post.destroy().then(() => {
                            console.info(
                                `[Delete Post] content: "${content}", ` +
                                `remoteAddress: "${req.connection.remoteAddress}", ` +
                                `userAgent: "${req.headers['user-agent']}"`
                            );
                            util.handleRedirectPosts(req, res);
                        });
                    });
                }
                else {
                    util.handleBadRequest(req, res);
                }
            });
            break;
        default:
            util.handleBadRequest(req, res);
            break;
    }
}

/**
 * Cookieに含まれているトラッキングIDに異常がなければその値を返す
 * 存在しない場合や異常なものである場合には再度作成しCookieに付与してその値を返す
 * @param {Cookies} cookies
 * @return {String} トラッキングID
 */
function addTrackingCookie(cookies) {
    const requestedTrackingId = cookies.get(trackingIdKey);
    if (isValidTrackingId(requestedTrackingId)) {
        return requestedTrackingId;
    }
    else {
        const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
        const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
        const trackingId = originalId + '_' + createValidHash(originalId);
        cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
        return trackingId;
    }
}

function isValidTrackingId(trackingId) {
    if (!trackingId) return false;
    const splitted = trackingId.split('_');
    const originalId = splitted[0];
    const requestedHash = splitted[1];
    return createValidHash(originalId) === requestedHash;
}

const secretKey = `f6dde44b5618a1b9f985e65c2678f5e11fa63f5fc3fe013a
30cd7c47de5eb72c333f0c40a989a085015a7f67e7625a26bdece72f840b4c628ce
e532c0e29c413b32501e2d38884dead25a73fd05285c64ed777ca0865e91cd7d510
9a3486e4545f1cb1471dce9fb3ff8d5761916758edc44f75e58d2e3400af5763e6e
543df51cce516c823deda2351689c6df4af08ba6749463d81a2651295e08360bd80
f712bf2f14489e3f5bb4d8b77368516d77b4a99fcd65a8c3c3b00d2f432cbe3063b
dfb335774ae607b9595f8d74f54136d7179158053261d937451009b1544b4981ca9
39743d3bae88d990941d611d2a111b90095e7e43181f12f6ef8d2c6751c23c`;

function createValidHash(originalId) {
    const sha1sum = crypto.createHash('sha1');
    sha1sum.update(originalId + secretKey);
    return sha1sum.digest('hex');
}

module.exports = {
    handle,
    handlePost,
    handleDelete
};
