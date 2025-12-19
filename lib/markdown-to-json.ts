import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { editorExtensions } from "@/components/raich-text-editor/extensions";
import { generateJSON } from "@tiptap/react";
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
export const markdownToJson = (markdown: string) => {
  const html = md.render(markdown);
  const cleanHTML = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return generateJSON(cleanHTML, editorExtensions);
};
