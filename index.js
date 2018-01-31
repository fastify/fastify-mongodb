'use strict'

const urlModule = require('url')
const omit = require('lodash.omit')
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

  if (databaseName) {
    mongo.db = client.db(databaseName)
  }

  if (!fastify.mongo) {
    fastify.decorate('mongo', mongo)
  }

  next()
}

function fastifyMongodb (fastify, options, next) {
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

  const name = options.name

  const databaseName = options.database || (urlParsed.pathname ? urlParsed.pathname.substr(1) : undefined)

  options = omit(options, ['url', 'name', 'database'])
  MongoClient.connect(url, options, function onConnect (err, client) {
    if (err) {
      next(err)
      return
    }

    decorateFastifyInstance(fastify, client, {
      database: databaseName,
      name: name
    }, next)
  })
}

module.exports = fp(fastifyMongodb, {
  fastify: '>=0.39',
  name: 'fastify-mongodb'
})
