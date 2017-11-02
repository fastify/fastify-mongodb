'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyMongo = require('./index')
const url = 'mongodb://127.0.0.1'

test('fastify.mongo should exist', t => {
  t.plan(4)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    url
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.db)
    t.ok(fastify.mongo.ObjectId)

    fastify.close()
  })
})

test('fastify.mongo.ObjectId should be a mongo ObjectId', t => {
  t.plan(5)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    url
  })

  fastify.ready(err => {
    t.error(err)

    const obj1 = new fastify.mongo.ObjectId()
    t.ok(obj1)

    const obj2 = new fastify.mongo.ObjectId(obj1)
    t.ok(obj2)
    t.ok(obj1.equals(obj2))

    const obj3 = new fastify.mongo.ObjectId()
    t.notOk(obj1.equals(obj3))

    fastify.close()
  })
})

test('fastify.mongo.db should be the mongo database client', t => {
  t.plan(3)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    url
  })

  fastify.ready(err => {
    t.error(err)

    const db = fastify.mongo.db
    const col = db.collection('test')

    col.insertOne({ a: 1 }, (err, r) => {
      t.error(err)
      t.equal(1, r.insertedCount)

      fastify.close()
    })
  })
})

test('should call connection callback if specified', t => {
  t.plan(2)

  const fastify = Fastify()

  let called

  fastify.register(fastifyMongo, {
    url,
    onConnect: () => (called = true)
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(called)

    fastify.close()
  })
})
