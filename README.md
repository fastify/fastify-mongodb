# fastify-mongodb

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)  ![CI workflow](https://github.com/fastify/fastify-mongodb/workflows/CI%20workflow/badge.svg)

Fastify MongoDB connection plugin, with this you can share the same MongoDb connection pool in every part of your server.

Under the hood the official [mongodb](https://github.com/mongodb/node-mongodb-native) driver is used,
the options that you pass to `register` will be passed to the Mongo client.
The `mongodb` driver version is 3.

If you don't provide the client by yourself (see below), the url option is *required*.

## Install

```
npm i fastify-mongodb --save
```

## Usage
Add it to your project with `register` and you are done!  

```js
const fastify = require('fastify')()

fastify.register(require('fastify-mongodb'), {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  
  url: 'mongodb://mongo/mydb'
})

fastify.get('/user/:id', function (req, reply) {
  // Or this.mongo.client.db('mydb')
  const db = this.mongo.db
  db.collection('users', onCollection)

  function onCollection (err, col) {
    if (err) return reply.send(err)

    col.findOne({ id: req.params.id }, (err, user) => {
      reply.send(user)
    })
  }
})

fastify.listen(3000, err => {
  if (err) throw err
})
```

You may also supply a pre-configured instance of `mongodb.MongoClient`:

```js
const mongodb = require('mongodb')
mongodb.MongoClient.connect('mongodb://mongo/db')
  .then((client) => {
    const fastify = require('fastify')()

    fastify.register(require('fastify-mongodb'), { client: client })
      .register(function (fastify, opts, next) {
        const db = fastify.mongo.client.db('mydb')
        // ...
        // ...
        // ...
        next()
      })
  })
  .catch((err) => {
    throw err
  })
```

Notes: 
* the passed `client` connection will **not** be closed when the Fastify server
shuts down.
* in order to terminate the mongodb connection you have to manually call the [fastify.close](https://www.fastify.io/docs/latest/Server/#close) method (for example for testing purposes, otherwise the test will hang).

## Reference

This plugin decorates the `fastify` instance with a `mongo` object. That object has the
following properties:

- `client` is the [`MongoClient` instance](http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html)
- `ObjectId` is the [`ObjectId` class](http://mongodb.github.io/node-mongodb-native/3.3/api/ObjectID.html)
- `db` is the [`DB` instance](http://mongodb.github.io/node-mongodb-native/3.3/api/Db.html)

The `db` property is added **only if**:
- a `database` string option is given during the plugin registration.
- the connection string contains the database name. See the [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/#connection-string-uri-format)

A `name` option can be used in order to connect to multiple mongodb clusters.

```js
const fastify = require('fastify')()

fastify
  .register(require('fastify-mongodb'), { url: 'mongodb://mongo1/mydb', name: 'MONGO1' })
  .register(require('fastify-mongodb'), { url: 'mongodb://mongo2/otherdb', name: 'MONGO2' })

fastify.get('/', function (req, res) {
  // This collection comes from "mongodb://mongo1/mydb"
  const coll1 = this.mongo.MONGO1.db.collection('my_collection')
  // This collection comes from "mongodb://mongo2/otherdb"
  const coll2 = this.mongo.MONGO2.db.collection('my_collection')
  // ...
  // ...
  // do your stuff here
  // ...
  // ...
  res.send(yourResult)
})
```

## Acknowledgements

This project is kindly sponsored by:
- [nearForm](http://nearform.com)
- [LetzDoIt](http://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).
