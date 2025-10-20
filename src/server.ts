import Fastify, { type FastifyInstance } from "fastify";
import { loggerOptions } from "./util/log";
import { IndexRoute } from "./routes/index";

const server: FastifyInstance = Fastify({ logger: loggerOptions });

server.route(IndexRoute);

server.listen(
  {
    port: Number(process.env.PORT) || 3000,
    host: "0.0.0.0",
  },
  (err: Error | null, address?: string) => {
    if (err) {
      server.log.fatal(err, "Failed to start server");
      process.exit(1);
    }
    server.log.info(`Server listening on ${address}`);
  },
);

export default server;
