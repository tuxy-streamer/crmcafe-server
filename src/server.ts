import Fastify, { type FastifyInstance } from "fastify";
import { loggerOptions } from "./util/log";
import { IndexRoute } from "./routes/index";
import { HealthRoute } from "./routes/health";
import { registerAllRoutes } from "./routes/register";

const server: FastifyInstance = Fastify({ logger: loggerOptions });

server.route(IndexRoute);
server.route(HealthRoute);
await registerAllRoutes(server);

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
