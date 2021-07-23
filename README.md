# Textboard

## Development

### DB Server

#### Start

```sh
$ brew services start postgresql
$ createdb textboard
```

#### Stop

```sh
$ dropdb textboard
$ brew services stop postgresql
```

### Web Server

#### Setup

```sh
$ npm install
```

#### Start

```sh
$ npm start
```

#### Test

```sh
$ npm run test
```

## Deployment

```sh
$ heroku create
$ heroku addons:create heroku-postgresql:hobby-dev
$ heroku config:set PGSSLMODE=require
$ git push heroku master
```
