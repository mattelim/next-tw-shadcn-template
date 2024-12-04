import { handleCommonErrors } from "@/lib/utils";
import { NextApiResponse } from "next";
import OpenAI from "openai";

// export type Data = {
//   name?: string;
//   data: string;
// };

export type ApiType = "OLLAMA" | "OPENAI";

export const DEFAULT_API_TYPE: ApiType = "OLLAMA";

export const openAIApiKey = process.env.OPENAI_API_KEY;

export const ollamaApiKey = process.env.OLLAMA_API_KEY;

export const openai = new OpenAI({
  apiKey: openAIApiKey,
});

export function defaultErrorHandler(
  error: any,
  res: NextApiResponse,
  apiType = DEFAULT_API_TYPE,
) {
  if (error.response) {
    console.error(error.response.status, error.response.data);
    return res.status(error.response.status).json(error.response.data);
  } else {
    console.error(`Error with ${apiType} API request: ${error.message}`);
    return res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
}

export function emptyPromptHandler(prompt: string, res: NextApiResponse) {
  if (prompt.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: "Your prompt is empty",
      },
    });
  }
}

export async function apiCallHandler(
  prompt: string,
  messages: object[],
  res: NextApiResponse,
  apiType = DEFAULT_API_TYPE,
  modelOverride?: string,
) {
  console.log("User prompt:", prompt);
  switch (apiType) {
    case "OLLAMA": {
      const completion = await fetch("https://ollama.mattl.im/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ollamaApiKey}`,
        },
        body: JSON.stringify({
          model: modelOverride || "qwen2.5-coder:7b",
          messages,
        }),
      });
      const completionJson = await completion.json();
      console.log(completionJson);
      let ollamaRes = completionJson.message.content;
      ollamaRes = handleCommonErrors(ollamaRes as string);
      console.log("Sent: " + ollamaRes);
      return res.status(200).json({ data: ollamaRes });
    }
    case "OPENAI":
    default: {
      const completion = await openai.chat.completions.create({
        model: modelOverride || "gpt-4o-mini",
        messages,
      });
      console.log(completion);
      let oAIRes = completion.choices[0].message.content;
      oAIRes = handleCommonErrors(oAIRes as string);
      console.log("Sent: " + oAIRes);
      return res.status(200).json({ data: oAIRes });
    }
  }
}
