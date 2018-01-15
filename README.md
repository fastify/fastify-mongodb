# fastify-mongodb

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)  [![Build Status](https://travis-ci.org/fastify/fastify-mongodb.svg?branch=master)](https://travis-ci.org/fastify/fastify-mongodb)

Fastify MongoDB connection plugin, with this you can share the same MongoDb connection pool in every part of your server.

Under the hood the official [mongodb](https://github.com/mongodb/node-mongodb-native) driver is used, the options that you pass to `register` will be passed to the Mongo client. Pass the url option is *required*.

## Install
```
npm i fastify-mongodb --save
```
## Usage
Add it to your project with `register` and you are done!
You can access the *Mongo* database via `fastify.mongo.db` and *ObjectId* via `fastify.mongo.ObjectId`.
```js
const fastify = require('fastify')()

fastify.register(require('fastify-mongodb'), {
  url: 'mongodb://mongo/db'
})

fastify.get('/user/:id', (req, reply) => {
  const db = fastify.mongo.client.db('db')
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
  console.log(`server listening on ${fastify.server.address().port}`)
})
```

You may also supply a pre-configured instance of `mongodb.MongoClient`:

```js
const mongodb = require('mongodb')
mongodb.MongoClient.connect('mongodb://mongo/db')
  .then((client) => {
    const fastify = require('fastify')()

    fastify.register(require('fastify-mongodb'), {client})

    // ...
    // ...
    // ...
  })
  .catch((err) => {
    throw err
  })
```

Note: the passed `client` connection will be closed when the Fastify server
shutsdown.

## Acknowledgements

This project is kindly sponsored by:
- [nearForm](http://nearform.com)
- [LetzDoIt](http://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).
