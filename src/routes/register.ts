import { type FastifyInstance } from "fastify";
import { registerUserRoutes } from "./users";
import { registerCustomerRoutes } from "./customers";
import { registerTagRoutes } from "./tags";
import { registerCustomerTagRoutes } from "./customer_tags";
import { registerCallRoutes } from "./calls";
import { registerMessageRoutes } from "./messages";
import { registerTaskRoutes } from "./tasks";

export async function registerAllRoutes(app: FastifyInstance): Promise<void> {
  await registerUserRoutes(app);
  await registerCustomerRoutes(app);
  await registerTagRoutes(app);
  await registerCustomerTagRoutes(app);
  await registerCallRoutes(app);
  await registerMessageRoutes(app);
  await registerTaskRoutes(app);
}
