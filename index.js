'use strict'

const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function fastifyMongodb (fastify, options, next) {
  if (options.client) {
    const client = options.client
    delete options.client
    const mongo = {
      client: client,
      ObjectId: ObjectId
    }
    if (options.name) {
      mongo[options.name] = mongo
      delete options.name
    }
    fastify.decorate('mongo', mongo)
    fastify.addHook('onClose', (fastify, done) => client.close(done))
    return next()
  }

  const url = options.url
  delete options.url

  const name = options.name
  delete options.name

  MongoClient.connect(url, options, onConnect)

  function onConnect (err, client) {
    if (err) return next(err)

    const mongo = {
      client: client,
      ObjectId: ObjectId
    }

    fastify.addHook('onClose', (fastify, done) => client.close(done))

    if (name) {
      if (!fastify.mongo) {
        fastify.decorate('mongo', {})
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

module.exports = fp(fastifyMongodb, {
  fastify: '>=0.39.0',
  name: 'fastify-mongodb'
})
