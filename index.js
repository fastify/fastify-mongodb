'use strict'

const urlModule = require('url')
const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function decorateFastifyInstance (fastify, client, options, next) {
  fastify.addHook('onClose', (fastify, done) => client.close(done))

  const databaseName = options.database
  const name = options.name

  const mongo = {
    client: client,
    ObjectId: ObjectId
  }
  if (name) {
    if (!fastify.mongo) {
      fastify.decorate('mongo', mongo)
    }
    if (fastify.mongo[name]) {
      next(new Error('Connection name already registered: ' + name))
      return
    }

    fastify.mongo[name] = mongo
  } else {
    if (fastify.mongo) {
      next(new Error('fastify-mongodb has already registered'))
      return
    }
  }

  let pendingCollections = []

  if (databaseName) {
    mongo.db = client.db(databaseName)

    if (options.collections) {
      mongo.collections = {}

      pendingCollections = Object.keys(options.collections).map(function (collectionName) {
        const collection = mongo.db.collection(collectionName)

        return Promise.resolve(options.collections[collectionName](collection)).then(function () {
          mongo.collections[collectionName] = collection
        })
      })
    }
  }

  if (!fastify.mongo) {
    fastify.decorate('mongo', mongo)
  }

  Promise.all(pendingCollections).then(function () {
    next()
  })
}

function fastifyMongodb (fastify, options, next) {
  options = Object.assign({}, options)

  if (options.client) {
    decorateFastifyInstance(fastify, options.client, options, next)
    return
  }

  const url = options.url
  if (!url) {
    next(new Error('`url` parameter is mandatory if no client is provided'))
    return
  }
  const urlParsed = urlModule.parse(url)
  delete options.url

  const name = options.name
  delete options.name

  const databaseName = options.database || (urlParsed.pathname ? urlParsed.pathname.substr(1) : undefined)
  delete options.database

  const collections = options.collections
  delete options.collections

  MongoClient.connect(url, options, function onConnect (err, client) {
    if (err) {
      next(err)
      return
    }

    decorateFastifyInstance(fastify, client, {
      database: databaseName,
      name: name,
      collections: collections
    }, next)
  })
}

module.exports = fp(fastifyMongodb, {
  fastify: '>=1.0.0',
  name: 'fastify-mongodb'
})
