'use strict'

const t = require('tap')
const { test } = t
const Fastify = require('fastify')
const fastifyMongo = require('..')
const { ObjectId } = require('..')

const mongodb = require('mongodb')
const assert = require('assert')

const NO_DATABASE_MONGODB_URL = 'mongodb://127.0.0.1'
const DATABASE_NAME = 'test'
const MONGODB_URL = 'mongodb://127.0.0.1/' + DATABASE_NAME
const CLIENT_NAME = 'client_name'
const ANOTHER_DATABASE_NAME = 'my_awesome_database'
const COLLECTION_NAME = 'mycoll'

t.Test.prototype.addAssert('objectId', 1, function (ObjectId, message, extra) {
  message = message || 'expect ObjectId value'

  const obj1 = new ObjectId()
  assert.ok(obj1)

  const obj2 = new ObjectId(obj1)
  assert.ok(obj2)
  assert.ok(obj1.equals(obj2))

  const obj3 = new ObjectId()
  assert.ok(!obj1.equals(obj3))

  return this.pass(message)
})

t.Test.prototype.addAssert('client', 1, function (client, message, extra) {
  message = message || 'expect client'
  const db = client.db(DATABASE_NAME)

  const col = db.collection(COLLECTION_NAME)

  return this.resolves(async () => {
    const r = await col.insertMany([{ a: 1 }])
    assert.strictEqual(1, r.insertedCount)
  }, message, extra)
})

t.Test.prototype.addAssert('database', 1, function (db, message, extra) {
  message = message || 'expect database'

  const col = db.collection(COLLECTION_NAME)

  return this.resolves(async () => {
    const r = await col.insertMany([{ a: 1 }])
    assert.deepEqual(1, r.insertedCount)
  }, message, extra)
})

test('re-export ObjectId', async (t) => {
  t.plan(1)

  t.objectId(fastifyMongo.ObjectId)
})

test('re-export ObjectId destructured', async (t) => {
  t.plan(1)

  t.objectId(ObjectId)
})

test('export of mongodb', async (t) => {
  t.plan(2)
  t.same(typeof fastifyMongo.mongodb.ObjectId, 'function')
  t.same(fastifyMongo.mongodb.BSONType.array, 4)
})

test('{ url: NO_DATABASE_MONGODB_URL }', async (t) => {
  t.plan(6)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL })

  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.notOk(fastify.mongo.db)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
})

test('{ url: MONGODB_URL }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: MONGODB_URL })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME }', async (t) => {
  t.plan(11)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.notOk(fastify.mongo.db)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.notOk(fastify.mongo[CLIENT_NAME].db)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
})

test('{ url: MONGODB_URL, name: CLIENT_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, DATABASE_NAME)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.ok(fastify.mongo[CLIENT_NAME].db)
  t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
  t.database(fastify.mongo[CLIENT_NAME].db)
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.ok(fastify.mongo[CLIENT_NAME].db)
  t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
  t.database(fastify.mongo[CLIENT_NAME].db)
})

test('{ url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.ok(fastify.mongo[CLIENT_NAME].db)
  t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
  t.database(fastify.mongo[CLIENT_NAME].db)
})

test('{ url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)
})

test('{ url: MONGODB_URL, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)
})

test('{ client: client }', async (t) => {
  t.plan(6)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  t.teardown(client.close.bind(client))

  const fastify = await register(t, { client })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.notOk(fastify.mongo.db)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
})

test('{ client: client, database: DATABASE_NAME }', async (t) => {
  t.plan(8)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  t.teardown(client.close.bind(client))

  const fastify = await register(t, { client, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)
})

test('{ client: client, name: CLIENT_NAME }', async (t) => {
  t.plan(11)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  t.teardown(client.close.bind(client))

  const fastify = await register(t, { client, name: CLIENT_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.notOk(fastify.mongo.db)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.notOk(fastify.mongo[CLIENT_NAME].db)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
})

test('{ client: client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  t.teardown(client.close.bind(client))

  const fastify = await register(t, { client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.ok(fastify.mongo)
  t.ok(fastify.mongo.client)
  t.ok(fastify.mongo.ObjectId)
  t.ok(fastify.mongo.db)
  t.equal(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.ok(fastify.mongo[CLIENT_NAME].client)
  t.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.ok(fastify.mongo[CLIENT_NAME].db)
  t.equal(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)

  t.objectId(fastify.mongo[CLIENT_NAME].ObjectId)
  t.client(fastify.mongo[CLIENT_NAME].client)
  t.database(fastify.mongo[CLIENT_NAME].db)
})

test('{ client: client } does not set onClose', async (t) => {
  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  t.teardown(client.close.bind(client))

  const fastify = Fastify()
  fastify.register(fastifyMongo, { client, database: DATABASE_NAME })
  await fastify.ready()
  await fastify.close()

  t.database(fastify.mongo.db)
})

test('{ }', async (t) => {
  t.plan(2)
  try {
    await register(t, {})
  } catch (err) {
    t.ok(err)
    t.equal(err.message, '`url` parameter is mandatory if no client is provided')
  }
})

test('{ url: "unknown://protocol" }', async (t) => {
  t.plan(2)
  try {
    await register(t, { url: 'unknown://protocol' })
  } catch (err) {
    t.ok(err)
    t.match(err.message, /expected connection string/)
  }
})

test('double register without name', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  try {
    await fastify
      .register(fastifyMongo, { url: MONGODB_URL })
      .register(fastifyMongo, { url: MONGODB_URL })
      .ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'fastify-mongodb has already registered')
  }
})

test('double register with different name', async (t) => {
  t.plan(22)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify
    .register(fastifyMongo, { url: MONGODB_URL, name: 'client1' })
    .register(fastifyMongo, { url: NO_DATABASE_MONGODB_URL, name: 'client2', database: ANOTHER_DATABASE_NAME })
    .ready()

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

  t.objectId(fastify.mongo.ObjectId)
  t.client(fastify.mongo.client)
  t.database(fastify.mongo.db)

  t.objectId(fastify.mongo.client1.ObjectId)
  t.client(fastify.mongo.client1.client)
  t.database(fastify.mongo.client1.db)

  t.objectId(fastify.mongo.client2.ObjectId)
  t.client(fastify.mongo.client2.client)
  t.database(fastify.mongo.client2.db)
})

test('double register with the same name', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  try {
    await fastify
      .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
      .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
      .ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'Connection name already registered: ' + CLIENT_NAME)
  }
})

test('Immutable options', async (t) => {
  t.plan(1)

  const given = { url: MONGODB_URL, name: CLIENT_NAME, database: DATABASE_NAME }
  await register(t, given)
  t.same(given, {
    url: MONGODB_URL,
    name: CLIENT_NAME,
    database: DATABASE_NAME
  })
})

test('timeout', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  try {
    await fastify
      .register(fastifyMongo, { url: 'mongodb://127.0.0.1:9999' })
      .ready()
  } catch (err) {
    t.ok(err)
    t.equal(err.message, 'connect ECONNREFUSED 127.0.0.1:9999')
  }
})

async function register (t, options) {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifyMongo, options)

  await fastify.ready()

  return fastify
}
