import { NOTES_PATH, get_notes, get_prompts, prompt_llm } from "@/utils/utils";
import React from "react";

export default async function Page({
  params,
}: {
  params: { promptName: string; timePeriod: string };
}) {
  const prompt_name = params.promptName;
  const prompts = get_prompts();
  const prompt = prompts.find((p) => p.name === prompt_name);
  const notes_content = await get_notes();
  const appended_prompt = prompt?.prompt + "\n\n" + notes_content;
  const prompt_result = await prompt_llm(appended_prompt);

  return (
    <div>
      <div>{prompt?.prompt}</div>
      <div>{prompt_result}</div>
    </div>
  );
}
