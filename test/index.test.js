'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyMongo = require('..')
const { ObjectId } = require('..')

const mongodb = require('mongodb')

const NO_DATABASE_MONGODB_URL = 'mongodb://127.0.0.1'
const DATABASE_NAME = 'test'
const MONGODB_URL = 'mongodb://127.0.0.1/' + DATABASE_NAME
const CLIENT_NAME = 'client_name'
const ANOTHER_DATABASE_NAME = 'my_awesome_database'
const COLLECTION_NAME = 'mycoll'

function objectIdTest (t, ObjectId, message) {
  t.plan(4)
  message = message || 'expect ObjectId value'

  const obj1 = new ObjectId()
  t.assert.ok(obj1)

  const obj2 = new ObjectId(obj1)
  t.assert.ok(obj2)
  t.assert.ok(obj1.equals(obj2))

  const obj3 = new ObjectId()
  t.assert.ok(!obj1.equals(obj3))
}

async function clientTest (t, client, message) {
  t.plan(1)
  message = message || 'expect client'
  const db = client.db(DATABASE_NAME)

  const col = db.collection(COLLECTION_NAME)

  const r = await col.insertMany([{ a: 1 }])
  t.assert.strictEqual(1, r.insertedCount)
}

async function databaseTest (t, db, message) {
  t.plan(1)
  message = message || 'expect database'

  const col = db.collection(COLLECTION_NAME)

  const r = await col.insertMany([{ a: 1 }])
  t.assert.strictEqual(1, r.insertedCount)
}

test('re-export ObjectId', async (t) => {
  t.plan(1)
  await t.test(async t => objectIdTest(t, fastifyMongo.ObjectId))
})

test('re-export ObjectId destructured', async (t) => {
  t.plan(1)
  await t.test(async t => objectIdTest(t, ObjectId))
})

test('export of mongodb', async (t) => {
  t.plan(2)
  t.assert.strictEqual(typeof fastifyMongo.mongodb.ObjectId, 'function')
  t.assert.strictEqual(fastifyMongo.mongodb.BSONType.array, 4)
})

test('{ url: NO_DATABASE_MONGODB_URL }', async (t) => {
  t.plan(6)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL })

  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ifError(fastify.mongo.db)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
})

test('{ url: MONGODB_URL }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: MONGODB_URL })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME }', async (t) => {
  t.plan(11)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ifError(fastify.mongo.db)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ifError(fastify.mongo[CLIENT_NAME].db)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
})

test('{ url: MONGODB_URL, name: CLIENT_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, DATABASE_NAME)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ok(fastify.mongo[CLIENT_NAME].db)
  t.assert.strictEqual(fastify.mongo[CLIENT_NAME].db.databaseName, DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
  await t.test(async t => databaseTest(t, fastify.mongo[CLIENT_NAME].db))
})

test('{ url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ok(fastify.mongo[CLIENT_NAME].db)
  t.assert.strictEqual(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
  await t.test(async t => databaseTest(t, fastify.mongo[CLIENT_NAME].db))
})

test('{ url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ok(fastify.mongo[CLIENT_NAME].db)
  t.assert.strictEqual(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
  await t.test(async t => databaseTest(t, fastify.mongo[CLIENT_NAME].db))
})

test('{ url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: NO_DATABASE_MONGODB_URL, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))
})

test('{ url: MONGODB_URL, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(8)

  const fastify = await register(t, { url: MONGODB_URL, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))
})

test('{ client: client }', async (t) => {
  t.plan(6)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL)
  t.after(() => client.close())

  const fastify = await register(t, { client })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ifError(fastify.mongo.db)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
})

test('{ client: client, database: DATABASE_NAME }', async (t) => {
  t.plan(8)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL)
  t.after(() => client.close())

  const fastify = await register(t, { client, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))
})

test('{ client: client, name: CLIENT_NAME }', async (t) => {
  t.plan(11)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL)
  t.after(() => client.close())

  const fastify = await register(t, { client, name: CLIENT_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ifError(fastify.mongo.db)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ifError(fastify.mongo[CLIENT_NAME].db)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
})

test('{ client: client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME }', async (t) => {
  t.plan(15)

  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL)
  t.after(() => client.close())

  const fastify = await register(t, { client, name: CLIENT_NAME, database: ANOTHER_DATABASE_NAME })
  t.assert.ok(fastify.mongo)
  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, ANOTHER_DATABASE_NAME)

  t.assert.ok(fastify.mongo[CLIENT_NAME].client)
  t.assert.ok(fastify.mongo[CLIENT_NAME].ObjectId)
  t.assert.ok(fastify.mongo[CLIENT_NAME].db)
  t.assert.strictEqual(fastify.mongo[CLIENT_NAME].db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))

  await t.test(async t => objectIdTest(t, fastify.mongo[CLIENT_NAME].ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo[CLIENT_NAME].client))
  await t.test(async t => databaseTest(t, fastify.mongo[CLIENT_NAME].db))
})

test('{ client: client } does not set onClose', async (t) => {
  const client = await mongodb.MongoClient.connect(NO_DATABASE_MONGODB_URL)
  t.after(() => client.close())

  const fastify = Fastify()
  fastify.register(fastifyMongo, { client, database: DATABASE_NAME })
  await fastify.ready()
  await fastify.close()

  await t.test(async t => databaseTest(t, fastify.mongo.db))
})

test('{ }', async (t) => {
  t.plan(2)
  try {
    await register(t, {})
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '`url` parameter is mandatory if no client is provided')
  }
})

test('{ url: "unknown://protocol" }', async (t) => {
  t.plan(2)
  try {
    await register(t, { url: 'unknown://protocol' })
  } catch (err) {
    t.assert.ok(err)
    t.assert.match(err.message, /expected connection string/)
  }
})

test('double register without name', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify
      .register(fastifyMongo, { url: MONGODB_URL })
      .register(fastifyMongo, { url: MONGODB_URL })
      .ready()
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, 'fastify-mongodb has already registered')
  }
})

test('double register with different name', async (t) => {
  t.plan(22)

  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify
    .register(fastifyMongo, { url: MONGODB_URL, name: 'client1' })
    .register(fastifyMongo, { url: NO_DATABASE_MONGODB_URL, name: 'client2', database: ANOTHER_DATABASE_NAME })
    .ready()

  t.assert.ok(fastify.mongo)

  t.assert.ok(fastify.mongo.client)
  t.assert.ok(fastify.mongo.ObjectId)
  t.assert.ok(fastify.mongo.db)
  t.assert.strictEqual(fastify.mongo.db.databaseName, DATABASE_NAME)

  t.assert.ok(fastify.mongo.client1.client)
  t.assert.ok(fastify.mongo.client1.ObjectId)
  t.assert.ok(fastify.mongo.client1.db)
  t.assert.strictEqual(fastify.mongo.client1.db.databaseName, DATABASE_NAME)

  t.assert.ok(fastify.mongo.client2.client)
  t.assert.ok(fastify.mongo.client2.ObjectId)
  t.assert.ok(fastify.mongo.client2.db)
  t.assert.strictEqual(fastify.mongo.client2.db.databaseName, ANOTHER_DATABASE_NAME)

  await t.test(async t => objectIdTest(t, fastify.mongo.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client))
  await t.test(async t => databaseTest(t, fastify.mongo.db))

  await t.test(async t => objectIdTest(t, fastify.mongo.client1.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client1.client))
  await t.test(async t => databaseTest(t, fastify.mongo.client1.db))

  await t.test(async t => objectIdTest(t, fastify.mongo.client2.ObjectId))
  await t.test(async t => clientTest(t, fastify.mongo.client2.client))
  await t.test(async t => databaseTest(t, fastify.mongo.client2.db))
})

test('double register with the same name', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify
      .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
      .register(fastifyMongo, { url: MONGODB_URL, name: CLIENT_NAME })
      .ready()
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, 'Connection name already registered: ' + CLIENT_NAME)
  }
})

test('Immutable options', async (t) => {
  t.plan(1)

  const given = { url: MONGODB_URL, name: CLIENT_NAME, database: DATABASE_NAME }
  await register(t, given)
  t.assert.deepStrictEqual(given, {
    url: MONGODB_URL,
    name: CLIENT_NAME,
    database: DATABASE_NAME
  })
})

test('timeout', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify
      .register(fastifyMongo, { url: 'mongodb://127.0.0.1:9999' })
      .ready()
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, 'connect ECONNREFUSED 127.0.0.1:9999')
  }
})

async function register (t, options) {
  const fastify = Fastify()
  t.after(() => fastify.close())

  fastify.register(fastifyMongo, options)

  await fastify.ready()

  return fastify
}
