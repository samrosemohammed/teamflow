import { baseExtensions } from "@/components/raich-text-editor/extensions";
import { generateHTML, JSONContent } from "@tiptap/react";
export const convertJsonToHtml = (jsonConent: JSONContent): string => {
  try {
    const content =
      typeof jsonConent === "string" ? JSON.parse(jsonConent) : jsonConent;
    return generateHTML(content, baseExtensions);
  } catch (error) {
    console.log("Error converting JSON to HTML:", error);
    return "";
  }
};
