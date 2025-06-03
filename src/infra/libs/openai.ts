import { env } from "@/infra/config/env";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not defined in environment variables");
}

export const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY,
});
