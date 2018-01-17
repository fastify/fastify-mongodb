'use strict'

const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function fastifyMongodb (fastify, options, next) {
  if (options.client) {
    const client = options.client

    const databaseName = options.database

    const mongo = {
      client: client,
      ObjectId: ObjectId,
      dbs: {}
    }
    if (options.name) {
      mongo[options.name] = mongo
    }
    if (databaseName) {
      mongo.dbs[databaseName] = client.db(databaseName)
    }
    fastify.decorate('mongo', mongo)
    fastify.addHook('onClose', (fastify, done) => client.close(done))
    return next()
  }

  const url = options.url
  delete options.url

  const name = options.name
  delete options.name

  const databaseName = options.database
  delete options.database

  MongoClient.connect(url, options, onConnect)

  function onConnect (err, client) {
    if (err) return next(err)

    const mongo = {
      client: client,
      ObjectId: ObjectId,
      dbs: {}
    }

    if (databaseName) {
      mongo.dbs[databaseName] = client.db(databaseName)
    }

    fastify.addHook('onClose', (fastify, done) => client.close(done))

    if (name) {
      if (!fastify.mongo) {
        fastify.decorate('mongo', mongo)
      }

      fastify.mongo[name] = mongo
    } else {
      if (fastify.mongo) {
        next(new Error('fastify-mongo has already registered'))
        return
      } else {
        fastify.mongo = mongo
      }
    }

    next()
  }
}

module.exports = fp(fastifyMongodb, '>=0.13.1')
