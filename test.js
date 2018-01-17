'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyMongo = require('./index')

const mongodb = require('mongodb')

const MONGODB_URL = 'mongodb://127.0.0.1'
const CLIENT_NAME = 'client_name'
const DATABASE_NAME = 'my_awesome_database'
const COLLECTION_NAME = 'mycoll'

test('fastify.mongo should exist', t => {
  t.plan(4)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMongo, {
    url: MONGODB_URL
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
  })
})

test('fastify.mongo.dbs.test2 should exist', t => {
  t.plan(6)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMongo, {
    url: MONGODB_URL,
    database: DATABASE_NAME
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.dbs)
    t.ok(fastify.mongo.dbs[DATABASE_NAME])
  })
})

test('fastify.mongo.ObjectId should be a mongo ObjectId', t => {
  t.plan(5)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMongo, {
    url: MONGODB_URL
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
  })
})

test('fastify.mongo.db should be the mongo client', t => {
  t.plan(3)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  fastify.register(fastifyMongo, {
    url: MONGODB_URL
  })

  fastify.ready(err => {
    t.error(err)

    const db = fastify.mongo.client.db(DATABASE_NAME)
    const col = db.collection(COLLECTION_NAME)

    col.insertOne({ a: 1 }, (err, r) => {
      t.error(err)
      t.equal(1, r.insertedCount)
    })
  })
})

test('fastify.mongo[CLIENT_NAME] should exist', t => {
  t.plan(5)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  fastify.register(fastifyMongo, {
    name: CLIENT_NAME,
    url: MONGODB_URL
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo[CLIENT_NAME])
    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  })
})

test('fastify.mongo[CLIENT_NAME].dbs[DATABASE_NAME] should exist', t => {
  t.plan(9)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  fastify.register(fastifyMongo, {
    name: CLIENT_NAME,
    url: MONGODB_URL,
    database: DATABASE_NAME
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.dbs)
    t.ok(fastify.mongo.dbs[DATABASE_NAME])
    t.ok(fastify.mongo[CLIENT_NAME])
    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
    t.ok(fastify.mongo[CLIENT_NAME].dbs)
    t.ok(fastify.mongo[CLIENT_NAME].dbs[DATABASE_NAME])
  })
})

test('fastify.mongo[CLIENT_NAME].ObjectId should be a mongo ObjectId', t => {
  t.plan(5)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  fastify.register(fastifyMongo, {
    name: CLIENT_NAME,
    url: MONGODB_URL
  })

  fastify.ready(err => {
    t.error(err)

    const obj1 = new fastify.mongo[CLIENT_NAME].ObjectId()
    t.ok(obj1)

    const obj2 = new fastify.mongo[CLIENT_NAME].ObjectId(obj1)
    t.ok(obj2)
    t.ok(obj1.equals(obj2))

    const obj3 = new fastify.mongo[CLIENT_NAME].ObjectId()
    t.notOk(obj1.equals(obj3))
  })
})

test('fastify.mongo.db should be the mongo database client', t => {
  t.plan(3)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  fastify.register(fastifyMongo, {
    name: CLIENT_NAME,
    url: MONGODB_URL
  })

  fastify.ready(err => {
    t.error(err)

    const db = fastify.mongo[CLIENT_NAME].client.db(DATABASE_NAME)
    const col = db.collection(COLLECTION_NAME)

    col.insertOne({ a: 1 }, (err, r) => {
      t.error(err)
      t.equal(1, r.insertedCount)
    })
  })
})

test('accepts a pre-configured mongo client', t => {
  t.plan(3)

  mongodb.MongoClient.connect(MONGODB_URL)
    .then((client) => {
      const fastify = Fastify()
      t.tearDown(() => fastify.close())

      fastify.register(fastifyMongo, {client: client})
        .ready(err => {
          t.error(err)

          t.ok(fastify.mongo)
          t.ok(fastify.mongo.client)
        })
    })
    .catch(t.threw)
})

test('accepts a pre-configured mongo client with database', t => {
  t.plan(5)

  mongodb.MongoClient.connect(MONGODB_URL)
    .then((client) => {
      const fastify = Fastify()
      t.tearDown(() => fastify.close())

      fastify.register(fastifyMongo, {client: client, database: DATABASE_NAME})
        .ready(err => {
          t.error(err)

          t.ok(fastify.mongo)
          t.ok(fastify.mongo.client)
          t.ok(fastify.mongo.dbs)
          t.ok(fastify.mongo.dbs[DATABASE_NAME])
        })
    })
    .catch(t.threw)
})

test('accepts a pre-configured named mongo client', t => {
  t.plan(3)

  mongodb.MongoClient.connect(MONGODB_URL)
    .then((client) => {
      const fastify = Fastify()
      t.tearDown(() => fastify.close())

      fastify.register(fastifyMongo, {client: client, name: CLIENT_NAME})

      fastify.ready(err => {
        t.error(err)

        const db = fastify.mongo[CLIENT_NAME].client.db(DATABASE_NAME)
        const col = db.collection(COLLECTION_NAME)

        col.insertOne({ a: 1 }, (err, r) => {
          t.error(err)
          t.equal(1, r.insertedCount)
        })
      })
    })
    .catch(t.threw)
})

test('accepts a pre-configured named mongo client with database', t => {
  t.plan(9)

  mongodb.MongoClient.connect(MONGODB_URL)
    .then((client) => {
      const fastify = Fastify()
      t.tearDown(() => fastify.close())

      fastify.register(fastifyMongo, {client: client, name: CLIENT_NAME, database: DATABASE_NAME})

      fastify.ready(err => {
        t.error(err)

        t.ok(fastify.mongo)
        t.ok(fastify.mongo.client)
        t.ok(fastify.mongo.dbs)
        t.ok(fastify.mongo.dbs[DATABASE_NAME])
        t.ok(fastify.mongo[CLIENT_NAME])
        t.ok(fastify.mongo[CLIENT_NAME].client)
        t.ok(fastify.mongo[CLIENT_NAME].dbs)
        t.ok(fastify.mongo[CLIENT_NAME].dbs[DATABASE_NAME])
      })
    })
    .catch(t.threw)
})

test('throw if mongo is already added', t => {
  t.plan(1)

  const fastify = Fastify()
  t.tearDown(done => fastify.close(done))

  fastify.register(fastifyMongo, { url: MONGODB_URL })

  fastify.after(() => {
    fastify.register(fastifyMongo, { url: MONGODB_URL })
  })

  fastify.ready(err => {
    t.equal(err.message, 'fastify-mongo has already registered')
  })
})
