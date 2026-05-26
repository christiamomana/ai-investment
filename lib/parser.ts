import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

export function parseStudyHtml(htmlFile: string): string {
  const filePath = path.join(process.cwd(), "studies", htmlFile);
  if (!fs.existsSync(filePath)) return "";

  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav elements
  $("script, style, nav, header, footer, .nav, .header, .footer").remove();

  // Extract main content text
  const text = $("body").text();

  // Clean up excessive whitespace
  return text
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function studyExists(htmlFile: string): boolean {
  const filePath = path.join(process.cwd(), "studies", htmlFile);
  return fs.existsSync(filePath);
}
