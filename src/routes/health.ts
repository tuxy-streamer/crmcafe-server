import {
  type FastifyRequest,
  type FastifyReply,
  type RouteOptions,
} from "fastify";

const healthHandler: RouteOptions["handler"] = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  request.log.info("Request Received");
  reply.send({ message: "Welcome to CRM-Café's server" });
};

export const HealthRoute: RouteOptions = {
  method: "GET",
  url: "/",
  handler: healthHandler,
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
