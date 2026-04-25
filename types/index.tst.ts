import { ObjectId } from 'bson'
import fastify from 'fastify'
import { expect } from 'tstyche'
import fastifyMongodb, { mongodb, ObjectId as ReExportedObjectId } from '..'

const app = fastify()

app
  .register(fastifyMongodb, {
    database: 'testdb',
    name: 'db',
    url: 'mongodb://localhost:27017/testdb'
  })
  .after((_err) => {
    app.mongo.client.db('test')
    expect(app.mongo.db).type.not.toBe<undefined>()

    const ObjectIdFromApp = app.mongo.ObjectId
    expect(new ReExportedObjectId('aaaa')).type.toBe<ObjectId>()
    expect(new ObjectIdFromApp('aaa')).type.toBe<ObjectId>()
  })
expect(mongodb.ObjectId).type.toBe<typeof ReExportedObjectId>()
expect(mongodb.BSONType.array).type.toBe<4>()
