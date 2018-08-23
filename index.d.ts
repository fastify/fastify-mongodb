import * as mongodb from "mongodb"
import * as http from "http";
import * as fastify from "fastify";

declare module fastifyMongodb {
    interface FastifyMongodbOptions {
        forceClose?: boolean;
        database?: string;
        name?: string;
        client?: mongodb.MongoClient;
        url?: string;
    }
}

declare let fastifyMongodb: fastify.Plugin<
    http.Server,
    http.IncomingMessage,
    http.ServerResponse,
    fastifyMongodb.FastifyMongodbOptions
    >;

export = fastifyMongodb;
