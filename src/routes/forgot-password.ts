import {
  type FastifyRequest,
  type FastifyReply,
  type RouteOptions,
} from "fastify";

const forgotPasswordHandler: RouteOptions["handler"] = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  request.log.info("Request Received");
  reply.send({ message: "Welcome to CRM-Café's server" });
};

export const ForgotPasswordRoute: RouteOptions = {
  method: "GET",
  url: "/forgot-password",
  handler: forgotPasswordHandler,
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
