'use strict'

const fp = require('fastify-plugin')
const { MongoClient, ObjectId } = require('mongodb')

function decorateFastifyInstance (fastify, client, options) {
  const { forceClose, database, name, newClient } = options

  if (newClient) {
    // done() is not needed because .close() returns a Promise
    fastify.addHook('onClose', function closeMongoDb () {
      return client.close(forceClose)
    })
  }

  const mongo = {
    client,
    ObjectId
  }
  if (name) {
    if (!fastify.mongo) {
      fastify.decorate('mongo', mongo)
    }
    if (fastify.mongo[name]) {
      throw Error('Connection name already registered: ' + name)
    }

    fastify.mongo[name] = mongo
  } else {
    if (fastify.mongo) {
      throw Error('fastify-mongodb has already registered')
    }
  }

  if (database) {
    mongo.db = client.db(database)
  }

  if (!fastify.mongo) {
    fastify.decorate('mongo', mongo)
  }
}

async function fastifyMongodb (fastify, options) {
  options = Object.assign({
    serverSelectionTimeoutMS: 7500
  }, options)
  const { forceClose, name, database, url, client, ...opts } = options

  if (client) {
    decorateFastifyInstance(fastify, client, {
      newClient: false,
      forceClose,
      database,
      name
    })
  } else {
    if (!url) {
      throw Error('`url` parameter is mandatory if no client is provided')
    }

    const urlTokens = /\w\/([^?]*)/g.exec(url)
    const parsedDbName = urlTokens && urlTokens[1]
    const databaseName = database || parsedDbName

    const client = new MongoClient(url, opts)
    await client.connect()

    decorateFastifyInstance(fastify, client, {
      newClient: true,
      forceClose,
      database: databaseName,
      name
    })
  }
}

module.exports = fp(fastifyMongodb, {
  fastify: '5.x',
  name: '@fastify/mongodb'
})
module.exports.default = fastifyMongodb
module.exports.fastifyMongodb = fastifyMongodb

module.exports.mongodb = require('mongodb')

module.exports.ObjectId = ObjectId
