'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyMongo = require('./index')

test('fastify.mongo should exist', t => {
  t.plan(4)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    url: 'mongodb://127.0.0.1'
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
    url: 'mongodb://127.0.0.1'
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
    url: 'mongodb://127.0.0.1'
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

test('fastify.mongo.test should exist', t => {
  t.plan(5)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    name: 'test',
    url: 'mongodb://127.0.0.1'
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.test)
    t.ok(fastify.mongo.test.db)
    t.ok(fastify.mongo.test.ObjectId)

    fastify.close()
  })
})

test('fastify.mongo.test.ObjectId should be a mongo ObjectId', t => {
  t.plan(5)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    name: 'test',
    url: 'mongodb://127.0.0.1'
  })

  fastify.ready(err => {
    t.error(err)

    const obj1 = new fastify.mongo.test.ObjectId()
    t.ok(obj1)

    const obj2 = new fastify.mongo.test.ObjectId(obj1)
    t.ok(obj2)
    t.ok(obj1.equals(obj2))

    const obj3 = new fastify.mongo.test.ObjectId()
    t.notOk(obj1.equals(obj3))

    fastify.close()
  })
})

test('fastify.mongo.db should be the mongo database client', t => {
  t.plan(3)

  const fastify = Fastify()

  fastify.register(fastifyMongo, {
    name: 'test',
    url: 'mongodb://127.0.0.1'
  })

  fastify.ready(err => {
    t.error(err)

    const db = fastify.mongo.test.db
    const col = db.collection('test')

    col.insertOne({ a: 1 }, (err, r) => {
      t.error(err)
      t.equal(1, r.insertedCount)

      fastify.close()
    })
  })
})

test('accepts a pre-configured mongo database client', t => {
  t.plan(3)

  const mongodb = require('mongodb')
  mongodb.MongoClient.connect('mongodb://127.0.0.1/test')
    .then((db) => {
      const fastify = Fastify()
      fastify.register(fastifyMongo, {client: db, name: 'test'})

      fastify.ready(err => {
        t.error(err)

        const db = fastify.mongo.test.db
        const col = db.collection('test')

        col.insertOne({ a: 1 }, (err, r) => {
          t.error(err)
          t.equal(1, r.insertedCount)

          fastify.close()
        })
      })
    })
    .catch(t.threw)
})

test('throw if mongo is already added', t => {
  t.plan(1)

  const fastify = Fastify()
  t.tearDown(done => fastify.close(done))

  fastify.register(fastifyMongo, { url: 'mongodb://127.0.0.1' })

  fastify.after(() => {
    fastify.register(fastifyMongo, { url: 'mongodb://127.0.0.1' })
  })

  fastify.ready(err => {
    t.equal(err.message, 'fastify-mongo has already registered')
  })
})
