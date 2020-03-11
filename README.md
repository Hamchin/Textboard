# Free-Forum

https://free-forum.herokuapp.com

## Development

### Server 1

```
$ node index.js
```

### Server 2

```
$ postgres -D /usr/local/var/postgres
```

### Server 3

```
$ createdb forum

...

$ dropdb forum
```

## Deployment

```
$ heroku create
$ heroku addons:create heroku-postgresql:hobby-dev
$ git push heroku master
```
