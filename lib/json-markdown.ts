import { baseExtensions } from "@/components/raich-text-editor/extensions";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";

const normalizeWhiteSpace = (markdown: string) => {
  return markdown
    .replace(/\s+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const tipTapJsonToMarkdown = async (json: string) => {
  // parse json
  let content;
  try {
    content = JSON.parse(json);
  } catch {
    return "";
  }
  const markdown = renderToMarkdown({
    extensions: baseExtensions,
    content: content,
  });
  return normalizeWhiteSpace(markdown);
};
