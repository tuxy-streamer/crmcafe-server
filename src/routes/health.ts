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
  reply.send({ status: "ok" });
};

export const HealthRoute: RouteOptions = {
  method: "GET",
  url: "/health",
  handler: healthHandler,
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          status: { type: "string" },
        },
      },
    },
  },
};
