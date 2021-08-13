import fastify from 'fastify';
import fastifyMongodb, { ObjectId as reExportedObjectId } from '../fastify-mongodb';

const app = fastify();

app
  .register(fastifyMongodb, {
    database: 'testdb',
    name: 'db',
    url: 'mongodb://localhost:27017/testdb',
  })
  .after((err) => {
    const dbTest = app.mongo.client.db('test');
    const dbDb = app.mongo.db!;
    const ObjectId = app.mongo.ObjectId;
    const myId = new ObjectId('aaaa');
    const myId2 = new reExportedObjectId('aaaa');
  });
