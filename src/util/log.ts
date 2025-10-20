import pino, { type LoggerOptions } from "pino";
export const loggerOptions: LoggerOptions = {
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
      levelFirst: true,
    },
  },
  redact: ["password", "token", "authorization"],
  base: {
    service: "crmcafe-server",
    version: "1.0.0",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    bindings: (bindings) => ({
      ...bindings,
      env: process.env.NODE_ENV || "development",
    }),
  },
};
