import { GPTService } from "@/domain/financial-planning/services/gpt-service";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { z } from "zod";
import { openai } from "../libs/openai";

export class OpenAIGPTService implements GPTService {
  async parse<T extends z.ZodType>(options: ChatCompletionCreateParamsNonStreaming): Promise<T | null> {
    const completion = await openai.beta.chat.completions.parse(options);
    return completion.choices[0]?.message?.parsed || null;
  }
} 