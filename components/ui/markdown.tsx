import React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

let remark: typeof import("remark") | null = null;
let remarkHtml: typeof import("remark-html") | null = null;

async function markdownToHtml(md: string): Promise<string> {
  if (!remark) {
    remark = (await import("remark")).remark;
  }
  if (!remarkHtml) {
    remarkHtml = (await import("remark-html")).default;
  }
  const result = await remark().use(remarkHtml).process(md);
  return result.toString();
}

export function Markdown({ children }: { children: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [html, setHtml] = useState("");

  useEffect(() => {
    markdownToHtml(children || "").then(setHtml);
  }, [children]);

  return (
    <div
      className={
        (isDark ? "text-foreground rounded-lg" : "bg-background text-foreground rounded-lg") +
        " prose max-w-none"
      }
      style={isDark ? { background: "#0a0a0a" } : {}}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 