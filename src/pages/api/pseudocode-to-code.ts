// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { commentPrefixForLanguage } from "@/lib/utils";

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
  const selectedLanguage = req.body.selectedLanguage || "Python";
  const commentPrefix = commentPrefixForLanguage(selectedLanguage);
  emptyPromptHandler(prompt, res);

  const messages = [
    {
      role: "system",
      content: `You are an expert programmer specializing in translating pseudocode to working ${selectedLanguage} code.`,
    },
    {
      role: "user",
      content: `Answer only in ${selectedLanguage} code and include one example usage of the code in the format specified below. Include explanations from the pseudocode input as comments in the code.

Pseudocode input:
"""
${prompt}
"""

Your output must be in the following format:
"""
${commentPrefix} $CODE_START
${commentPrefix} {the code goes here}
${commentPrefix} $CODE_END

${commentPrefix} $EXAMPLE_START
${commentPrefix} {the example usage goes here}
${commentPrefix} $EXAMPLE_END
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
