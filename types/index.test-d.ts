import fastify from 'fastify';
import fastifyMongodb, { ObjectId as reExportedObjectId } from '..';
import { expectType } from "tsd";
import { ObjectID } from 'bson';

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
    expectType<ObjectID>(new reExportedObjectId('aaaa'))
    expectType<ObjectID>(new ObjectId('aaa'))
  });
