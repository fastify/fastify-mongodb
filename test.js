'use strict'

const t = require('tap')
const { test } = t
const Fastify = require('fastify')
const fastifyMongo = require('./index')

const mongodb = require('mongodb')

const NO_DATABASE_MONGODB_URL = 'mongodb://127.0.0.1'
const DATABASE_NAME = 'test'
const MONGODB_URL = 'mongodb://127.0.0.1/' + DATABASE_NAME
const CLIENT_NAME = 'client_name'
const ANOTHER_DATABASE_NAME = 'my_awesome_database'
const COLLECTION_NAME = 'mycoll'

test('{ url: NO_DATABASE_MONGODB_URL }', t => {
  t.plan(5 + 4 + 2)

  register(t, { url: NO_DATABASE_MONGODB_URL }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.notOk(fastify.mongo.db)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
  })
})

test('{ url: MONGODB_URL }', t => {
  t.plan(6 + 4 + 2 + 2)

  register(t, { url: MONGODB_URL }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)
  })
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME }', t => {
  t.plan(8 + 4 + 2 + 4 + 2)

  register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.notOk(fastify.mongo.db)

    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
    t.notOk(fastify.mongo[CLIENT_NAME].db)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)

    testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
    testClient(t, fastify.mongo[CLIENT_NAME].client)
  })
})

test('{ url: MONGODB_URL, name: CLIENT_NAME }', t => {
  t.plan(10 + 4 + 2 + 2 + 4 + 2 + 2)

  register(t, { url: MONGODB_URL, name: CLIENT_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, DATABASE_NAME)

    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
    t.ok(fastify.mongo[CLIENT_NAME].db)
    t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)

    testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
    testClient(t, fastify.mongo[CLIENT_NAME].client)
    testDatabase(t, fastify.mongo[CLIENT_NAME].db)
  })
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', t => {
  t.plan(10 + 4 + 2 + 2 + 4 + 2 + 2)

  register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
    t.ok(fastify.mongo[CLIENT_NAME].db)
    t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)

    testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
    testClient(t, fastify.mongo[CLIENT_NAME].client)
    testDatabase(t, fastify.mongo[CLIENT_NAME].db)
  })
})

test('{ url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', t => {
  t.plan(10 + 4 + 2 + 2 + 4 + 2 + 2)

  register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

    t.ok(fastify.mongo[CLIENT_NAME].client)
    t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
    t.ok(fastify.mongo[CLIENT_NAME].db)
    t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)

    testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
    testClient(t, fastify.mongo[CLIENT_NAME].client)
    testDatabase(t, fastify.mongo[CLIENT_NAME].db)
  })
})

test('{ url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME }', t => {
  t.plan(6 + 4 + 2 + 2)

  register(t, { url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)
  })
})

test('{ url: MONGODB_URL, database: ANOTHER_DATABASE_NAME }', t => {
  t.plan(6 + 4 + 2 + 2)

  register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
    t.error(err)
    t.ok(fastify.mongo)
    t.ok(fastify.mongo.client)
    t.ok(fastify.mongo.ObjectId)
    t.ok(fastify.mongo.db)
    t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

    testObjectId(t, fastify.mongo.ObjectId)
    testClient(t, fastify.mongo.client)
    testDatabase(t, fastify.mongo.db)
  })
})

test('{ client: client }', t => {
  t.plan(5 + 4 + 2)

  mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      t.teardown(client.close.bind(client))
      register(t, { client: client }, function (err, fastify) {
        t.error(err)
        t.ok(fastify.mongo)
        t.ok(fastify.mongo.client)
        t.ok(fastify.mongo.ObjectId)
        t.notOk(fastify.mongo.db)

        testObjectId(t, fastify.mongo.ObjectId)
        testClient(t, fastify.mongo.client)
      })
    })
    .catch(t.threw)
})

test('{ client: client, database: DATABASE_NAME }', t => {
  t.plan(6 + 4 + 2 + 2)

  mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      t.teardown(client.close.bind(client))
      register(t, { client: client, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
        t.error(err)
        t.ok(fastify.mongo)
        t.ok(fastify.mongo.client)
        t.ok(fastify.mongo.ObjectId)
        t.ok(fastify.mongo.db)
        t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

        testObjectId(t, fastify.mongo.ObjectId)
        testClient(t, fastify.mongo.client)
        testDatabase(t, fastify.mongo.db)
      })
    })
    .catch(t.threw)
})

test('{ client: client, name: CLIENT_NAME }', t => {
  t.plan(8 + 4 + 2 + 4 + 2)

  mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      t.teardown(client.close.bind(client))
      register(t, { client: client, name: CLIENT_NAME }, function (err, fastify) {
        t.error(err)
        t.ok(fastify.mongo)
        t.ok(fastify.mongo.client)
        t.ok(fastify.mongo.ObjectId)
        t.notOk(fastify.mongo.db)

        t.ok(fastify.mongo[CLIENT_NAME].client)
        t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
        t.notOk(fastify.mongo[CLIENT_NAME].db)

        testObjectId(t, fastify.mongo.ObjectId)
        testClient(t, fastify.mongo.client)

        testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
        testClient(t, fastify.mongo[CLIENT_NAME].client)
      })
    })
    .catch(t.threw)
})

test('{ client: client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', t => {
  t.plan(10 + 4 + 2 + 2 + 4 + 2 + 2)

  mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      t.teardown(client.close.bind(client))
      register(t, { client: client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }, function (err, fastify) {
        t.error(err)
        t.ok(fastify.mongo)
        t.ok(fastify.mongo.client)
        t.ok(fastify.mongo.ObjectId)
        t.ok(fastify.mongo.db)
        t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

        t.ok(fastify.mongo[CLIENT_NAME].client)
        t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
        t.ok(fastify.mongo[CLIENT_NAME].db)
        t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

        testObjectId(t, fastify.mongo.ObjectId)
        testClient(t, fastify.mongo.client)
        testDatabase(t, fastify.mongo.db)

        testObjectId(t, fastify.mongo[CLIENT_NAME].ObjectId)
        testClient(t, fastify.mongo[CLIENT_NAME].client)
        testDatabase(t, fastify.mongo[CLIENT_NAME].db)
      })
    })
    .catch(t.threw)
})

test('{ client: client } does not set onClose', t => {
  const fastify = Fastify()
  return mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      fastify.register(fastifyMongo, { client, database: DATABASE_NAME })
      return fastify.ready()
    })
    .then(() => {
      return fastify.close()
    })
    .then(() => {
      const col = fastify.mongo.db.collection(COLLECTION_NAME)
      return col
        .insertOne({ a: 1 })
        .then((r) => {
          t.equal(1, r.insertedCount)
        })
        .then(() => fastify.mongo.client.close())
    })
})

test('{ }', t => {
  t.plan(2)
  register(t, {}, function (err, fastify) {
    t.ok(err)
    t.equal(err.message, '`url` parameter is mandatory if no client is provided')
  })
})

test('{ url: "unknown://protocol" }', t => {
  t.plan(2)
  register(t, { url: 'unknown://protocol' }, function (err, fastify) {
    t.ok(err)
    t.match(err.message, /Invalid connection string/)
  })
})

test('double register without name', t => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMongo, { url: MONGODB_URL })
    .register(fastifyMongo, { url: MONGODB_URL })
    .ready(err => {
      t.ok(err)
      t.equal(err.message, 'fastify-mongodb has already registered')
    })
})

test('double register with different name', t => {
  t.plan(14 + 4 + 2 + 2 + 4 + 2 + 2 + 4 + 2 + 2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMongo, { url: MONGODB_URL, name: 'client1' })
    .register(fastifyMongo, { url: NO_DATABASE_MONGODB_URL, name: 'client2', database: ANOTHER_DATABASE_NAME })
    .ready(err => {
      t.error(err)
      t.ok(fastify.mongo)

      t.ok(fastify.mongo.client)
      t.ok(fastify.mongo.ObjectId)
      t.ok(fastify.mongo.db)
      t.equal(fastify.mongo.db.databaseName, DATABASE_NAME)

      t.ok(fastify.mongo.client1.client)
      t.ok(fastify.mongo.client1.ObjectId)
      t.ok(fastify.mongo.client1.db)
      t.equal(fastify.mongo.client1.db.databaseName, DATABASE_NAME)

      t.ok(fastify.mongo.client2.client)
      t.ok(fastify.mongo.client2.ObjectId)
      t.ok(fastify.mongo.client2.db)
      t.equal(fastify.mongo.client2.db.databaseName, ANOTHER_DATABASE_NAME)

      testObjectId(t, fastify.mongo.ObjectId)
      testClient(t, fastify.mongo.client)
      testDatabase(t, fastify.mongo.db)

      testObjectId(t, fastify.mongo.client1.ObjectId)
      testClient(t, fastify.mongo.client1.client)
      testDatabase(t, fastify.mongo.client1.db)

      testObjectId(t, fastify.mongo.client2.ObjectId)
      testClient(t, fastify.mongo.client2.client)
      testDatabase(t, fastify.mongo.client2.db)
    })
})

test('double register with the same name', t => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
    .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
    .ready(err => {
      t.ok(err)
      t.equal(err.message, 'Connection name already registered: ' + CLIENT_NAME)
    })
})

test('Immutable options', t => {
  t.plan(2)

  const given = { url: MONGODB_URL, name: CLIENT_NAME, database: DATABASE_NAME }
  register(t, given, function (err, fastify) {
    t.error(err)
    t.deepEqual(given, {
      url: MONGODB_URL,
      name: CLIENT_NAME,
      database: DATABASE_NAME
    })
  })
})

function register (t, options, callback) {
  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMongo, options)
    .ready(err => callback(err, fastify))
}

function testObjectId (t, ObjectId) {
  const obj1 = new ObjectId()
  t.ok(obj1)

  const obj2 = new ObjectId(obj1)
  t.ok(obj2)
  t.ok(obj1.equals(obj2))

  const obj3 = new ObjectId()
  t.notOk(obj1.equals(obj3))
}

function testClient (t, client) {
  testDatabase(t, client.db(DATABASE_NAME))
}

function testDatabase (t, db) {
  const col = db.collection(COLLECTION_NAME)

  col.insertOne({ a: 1 }, (err, r) => {
    t.error(err)
    t.equal(1, r.insertedCount)
  })
}
