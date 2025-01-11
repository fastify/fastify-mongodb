# @fastify/mongodb

[![CI](https://github.com/fastify/fastify-mongodb/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/fastify/fastify-mongodb/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/@fastify/mongodb.svg?style=flat)](https://www.npmjs.com/package/@fastify/mongodb)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

Fastify MongoDB connection plugin; with this you can share the same MongoDB connection pool in every part of your server.

Under the hood the official [MongoDB](https://github.com/mongodb/node-mongodb-native) driver is used,
the options that you pass to `register` will be passed to the Mongo client.
The `mongodb` driver is v6.x.x.

If you do not provide the client by yourself (see below), the URL option is *required*.

## Install

```
npm i @fastify/mongodb
```

## Usage
Add it to your project with `register` and you are done!

```js
const fastify = require('fastify')()

fastify.register(require('@fastify/mongodb'), {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,

  url: 'mongodb://mongo/mydb'
})

fastify.get('/user/:id', async function (req, reply) {
  // Or this.mongo.client.db('mydb').collection('users')
  const users = this.mongo.db.collection('users')

  // if the id is an ObjectId format, you need to create a new ObjectId
  const id = new this.mongo.ObjectId(req.params.id)
  try {
    const user = await users.findOne({ id })
    return user
  } catch (err) {
    return err
  }
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
})
```

You may also supply a pre-configured instance of `mongodb.MongoClient`:

```js
const mongodb = require('mongodb')
mongodb.MongoClient.connect('mongodb://mongo/db')
  .then((client) => {
    const fastify = require('fastify')()

    fastify.register(require('@fastify/mongodb'), { client: client })
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
* to terminate the MongoDB connection you have to manually call the [fastify.close](https://fastify.dev/docs/latest/Reference/Server/#close) method (for example for testing purposes, otherwise the test will hang).
* `mongodb` connection timeout is reduced from 30s (default) to 7.5s to throw an error before `fastify` plugin timeout.

## Reference

This plugin decorates the `fastify` instance with a `mongo` object. That object has the
following properties:

- `client` is the [`MongoClient` instance](http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html)
- `ObjectId` is the [`ObjectId` class](http://mongodb.github.io/node-mongodb-native/3.3/api/ObjectID.html)
- `db` is the [`DB` instance](http://mongodb.github.io/node-mongodb-native/3.3/api/Db.html)

The `ObjectId` class can also be directly imported from the plugin as it gets re-exported from `mongodb`:

```js
const { ObjectId } = require('@fastify/mongodb')

const id = new ObjectId('some-id-here')
```

The `db` property is added **only if**:
- a `database` string option is given during the plugin registration.
- the connection string contains the database name. See the [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/#connection-string-uri-format)

A `name` option can be used to connect to multiple MongoDB clusters.

```js
const fastify = require('fastify')()

fastify
  .register(require('@fastify/mongodb'), { url: 'mongodb://mongo1/mydb', name: 'MONGO1' })
  .register(require('@fastify/mongodb'), { url: 'mongodb://mongo2/otherdb', name: 'MONGO2' })

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

## Acknowledgments

This project is kindly sponsored by:
- [nearForm](https://nearform.com)
- [LetzDoIt](https://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).
