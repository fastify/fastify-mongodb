import * as mongodb from 'mongodb';
import * as http from 'http';
import * as fastify from 'fastify';

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
    ObjectId: mongodb.ObjectId;
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
  interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    mongo: fastifyMongodb.FastifyMongoObject & fastifyMongodb.FastifyMongoNestedObject;
  }
}

declare let fastifyMongodb: fastify.Plugin<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  fastifyMongodb.FastifyMongodbOptions
>;

export = fastifyMongodb;
