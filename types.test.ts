import fastify = require("fastify");
import fastifyMongodb = require("../fastify-mongodb");

const app = fastify();

app.register(fastifyMongodb, {
    database: "testdb",
    name: "db",
    url: "mongodb://localhost:27017/testdb",
});
