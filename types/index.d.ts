import type { FastifyPluginAsync } from 'fastify'
import type { Db, MongoClient, MongoClientOptions } from 'mongodb'
import mongodb, { ObjectId } from 'mongodb'

declare module 'fastify' {
  interface FastifyInstance {
    mongo: fastifyMongodb.FastifyMongoObject & fastifyMongodb.FastifyMongoNestedObject;
  }
}

type FastifyMongodb = FastifyPluginAsync<fastifyMongodb.FastifyMongodbOptions>

declare namespace fastifyMongodb {

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
    ObjectId: typeof mongodb.ObjectId;
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

  export { ObjectId, mongodb }

  export const fastifyMongodb: FastifyMongodb
  export { fastifyMongodb as default }
}

declare function fastifyMongodb (...params: Parameters<FastifyMongodb>): ReturnType<FastifyMongodb>
export = fastifyMongodb
