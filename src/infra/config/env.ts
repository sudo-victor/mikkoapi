import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	OPENAI_API_KEY: z.string(),
	AWS_REGION: z.string(),
	AWS_ACCESS_KEY_ID: z.string(),
	AWS_SECRET_ACCESS_KEY: z.string(),
	AWS_BUCKET_NAME: z.string(),
	AWS_ENDPOINT: z.string(),
	AWS_SNS_TOPIC_ARN: z.string(),
	NODE_ENV: z.string().default("development"),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string().default("7d"),
	CATEGORIZE_EXTRACT_QUEUE_URL: z.string(),
	CATEGORIZE_EXTRACT_QUEUE_ARN: z.string()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error("❌ Invalid environment variables:", _env.error.format());
	throw new Error("Invalid environment variables.");
}

export const env = _env.data;
