import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { openai } from "@/infra/libs/openai";
import { z } from "zod";

export interface GPTService {
  parse<T extends z.ZodType>(options: ChatCompletionCreateParamsNonStreaming): Promise<T | null>;
}
