// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

// import { handleCommonErrors } from "@/lib/utils";

import {
  DEFAULT_API_TYPE,
  defaultErrorHandler,
  emptyPromptHandler,
  apiCallHandler,
  modelOverrideHandler,
} from "./apiUtil";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // res.status(200).json({ name: "John Doe" });
  const prompt = req.body.prompt || "";
  const modelOverride = modelOverrideHandler(req.body.modelQuality);
  console.log("modelOverride:", modelOverride);
  emptyPromptHandler(prompt, res);
  const messages = [
    {
      role: "system",
      content:
        "You are an expert coding teacher. You will convert a user's prompt into explanatory pseudocode that is understandable for a sixth grade student. Please also include types for variables, arguments, and return values.",
    },
    {
      role: "user",
      content: `Answer only in pseudocode.

User prompt:
"""
${prompt}
"""
`,
    },
  ];
  try {
    await apiCallHandler(
      prompt,
      messages,
      res,
      DEFAULT_API_TYPE,
      modelOverride,
    );
  } catch (error: any) {
    await defaultErrorHandler(error, res, DEFAULT_API_TYPE);
  }
}
