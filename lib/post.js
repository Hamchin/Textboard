'use strict';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgres://localhost/textboard',
    { logging: false, operatorsAliases: false }
);

const Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: Sequelize.TEXT
    },
    trackingCookie: {
        type: Sequelize.STRING
    }
},
    {
        freezeTableName: true,
        timestamps: true
    }
);

Post.sync();
module.exports = Post;
