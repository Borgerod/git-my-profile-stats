import fs from "fs";
import path from "path";

export function getTheme(): "dark" | "light" {
  const iniPath = path.join(process.cwd(), "src", "settings.ini");
  const content = fs.readFileSync(iniPath, "utf-8");
  const match = content.match(/^theme\s*=\s*(dark|light)/m);
  if (!match) throw new Error("theme must be 'dark' or 'light'");
  return match[1] as "dark" | "light";
}
