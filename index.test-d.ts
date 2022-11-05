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
    app.mongo.client.db('test');
    app.mongo.db!;
    const ObjectId = app.mongo.ObjectId;
    new ObjectId('aaaa');
    new reExportedObjectId('aaaa');
  });
