import pino from "pino";

const isLambdaEnvironment = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isLambdaEnvironment 
    ? undefined // Não use transport no ambiente Lambda
    : {
        target: "pino-pretty",
        options: { colorize: true }
      },
});
