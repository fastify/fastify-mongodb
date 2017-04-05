'use strict'

const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function fastifyMongodb (fastify, options, next) {
  const url = options.url
  delete options.url

  MongoClient.connect(url, options, onConnect)

  function onConnect (err, db) {
    if (err) return next(err)

    const mongo = {
      db: db,
      ObjectId: ObjectId
    }

    fastify
      .decorate('mongo', mongo)
      .addHook('onClose', close)

    next()
  }
}

function close (fastify, done) {
  fastify.mongo.db.close(function onClose (err) {
    done(err)
  })
}

module.exports = fp(fastifyMongodb, '>=0.13.1')
