import * as mongodb from 'mongodb';
import fastify, { FastifyPlugin } from 'fastify';

declare namespace fastifyMongodb {
  interface FastifyMongoObject {
    /**
     * Mongo client instance
     */
    client: mongodb.MongoClient;
    /**
     * DB instance
     */
    db?: mongodb.Db;
    /**
     * Mongo ObjectId class
     */
    ObjectId: typeof mongodb.ObjectId;
  }

  interface FastifyMongoNestedObject {
    [name: string]: FastifyMongoObject;
  }

  interface FastifyMongodbOptions {
    /**
     * Force to close the mongodb connection when app stopped
     * @default false
     */
    forceClose?: boolean;
    /**
     * Database name to connect
     */
    database?: string;
    name?: string;
    /**
     * Pre-configured instance of MongoClient
     */
    client?: mongodb.MongoClient;
    /**
     * Connection url
     */
    url?: string;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    mongo: fastifyMongodb.FastifyMongoObject & fastifyMongodb.FastifyMongoNestedObject;
  }
}

declare const fastifyMongodb: FastifyPlugin<fastifyMongodb.FastifyMongodbOptions>;

export default fastifyMongodb;
