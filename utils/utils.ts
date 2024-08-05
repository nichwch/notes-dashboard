import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

export const PROMPT_PATH = "./prompt-path.json";
export const NOTES_PATH = "../test-notes";

export type Prompt = {
  name: string;
  prompt: string;
};

export const get_prompts = () => {
  let prompts: Prompt[];
  try {
    prompts = JSON.parse(fs.readFileSync(PROMPT_PATH, "utf-8")) as Prompt[];
  } catch (e) {
    // create PROMPT_MAP_PATH if not exists
    fs.writeFileSync(PROMPT_PATH, "[]");
    prompts = [] as Prompt[];
  }

  return prompts;
};

export const get_notes = (): Promise<string> => {
  let totalContent = "";
  const delimiter = "\n" + "=".repeat(50) + "\n";

  async function readFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading file ${filePath}: ${err}`);
          resolve(); // Resolve even on error to continue processing
        } else {
          totalContent += `${delimiter}File: ${filePath}\n\n${data}\n`;
          resolve();
        }
      });
    });
  }

  function walkDir(currentPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readdir(currentPath, { withFileTypes: true }, async (err, entries) => {
        if (err) {
          console.error(`Error reading directory ${currentPath}: ${err}`);
          resolve(); // Resolve even on error to continue processing
          return;
        }
        const promises = [];
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          if (entry.isDirectory()) {
            promises.push(walkDir(fullPath));
          } else if (entry.isFile()) {
            promises.push(readFile(fullPath));
          }
        }
        await Promise.all(promises);
        resolve();
      });
    });
  }

  return walkDir(NOTES_PATH).then(() => totalContent);
};

const anthropic = new Anthropic({
  // defaults to process.env["ANTHROPIC_API_KEY"]
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const prompt_llm = async (prompt: string): Promise<string> => {
  console.log(prompt);
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    temperature: 0.5,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });
  console.log(msg);
  return msg.content[0].text!;
};
