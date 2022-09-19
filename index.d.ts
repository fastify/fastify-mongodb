import type { FastifyPluginAsync } from 'fastify';
import type { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { ObjectId } from 'mongodb';

export interface FastifyMongoObject {
  /**
   * Mongo client instance
   */
  client: MongoClient;
  /**
   * DB instance
   */
  db?: Db;
  /**
   * Mongo ObjectId class
   */
  ObjectId: typeof ObjectId;
}

export interface FastifyMongoNestedObject {
  [name: string]: FastifyMongoObject;
}

export interface FastifyMongodbOptions extends MongoClientOptions {
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
  client?: MongoClient;
  /**
   * Connection url
   */
  url?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    mongo: FastifyMongoObject & FastifyMongoNestedObject;
  }
}

export const fastifyMongodb: FastifyPluginAsync<FastifyMongodbOptions>;

export default fastifyMongodb;

export { ObjectId };
