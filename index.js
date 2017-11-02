'use strict'

const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function fastifyMongodb (fastify, options, next) {
  const url = options.url
  delete options.url

  const onConnect = options.onConnect
  delete options.onConnect

  MongoClient.connect(url, options, _onConnect)

  function _onConnect (err, db) {
    if (err) {
      if (onConnect) onConnect(err)
      return next(err)
    }

    if (onConnect) onConnect(null, db)

    const mongo = {
      db: db,
      ObjectId: ObjectId
    }

    fastify.decorate('mongo', mongo).addHook('onClose', close)

    next()
  }
}

function close (fastify, done) {
  fastify.mongo.db.close(done)
}

module.exports = fp(fastifyMongodb, '>=0.13.1')
