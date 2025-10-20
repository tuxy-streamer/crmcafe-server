import {
  type FastifyRequest,
  type FastifyReply,
  type RouteOptions,
} from "fastify";

const indexHandler: RouteOptions["handler"] = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  request.log.info("Request Received");
  reply.send({ message: "Welcome to CRM-Café's server" });
};

export const IndexRoute: RouteOptions = {
  method: "GET",
  url: "/",
  handler: indexHandler,
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
