import { ObjectId } from 'bson';
import fastify from 'fastify';
import { expectType } from "tsd";
import fastifyMongodb, { mongodb, ObjectId as reExportedObjectId } from '..';

const app = fastify();

app
  .register(fastifyMongodb, {
    database: 'testdb',
    name: 'db',
    url: 'mongodb://localhost:27017/testdb',
  })
  .after((err) => {
    app.mongo.client.db('test');
    app.mongo.db!;
    const ObjectId = app.mongo.ObjectId;
    expectType<ObjectId>(new reExportedObjectId('aaaa'))
    expectType<ObjectId>(new ObjectId('aaa'))
  });

expectType<typeof reExportedObjectId>(mongodb.ObjectId)
expectType<4>(mongodb.BSONType.array)
