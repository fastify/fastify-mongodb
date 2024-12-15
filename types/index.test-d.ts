import { ObjectId } from 'bson'
import fastify from 'fastify'
import { expectNotType, expectType } from 'tsd'
import fastifyMongodb, { mongodb, ObjectId as ReExportedObjectId } from '..'

const app = fastify()

app
  .register(fastifyMongodb, {
    database: 'testdb',
    name: 'db',
    url: 'mongodb://localhost:27017/testdb',
  })
  .after((_err) => {
    app.mongo.client.db('test')
    expectNotType<undefined>(app.mongo.db)
    const ObjectId = app.mongo.ObjectId
    expectType<ObjectId>(new ReExportedObjectId('aaaa'))
    expectType<ObjectId>(new ObjectId('aaa'))
  })

expectType<typeof ReExportedObjectId>(mongodb.ObjectId)
expectType<4>(mongodb.BSONType.array)
