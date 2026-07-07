/**
 * Lightweight helpers to derive a table of contents from ProseMirror/Tiptap content.
 * Walks the JSON tree and produces flat entries for heading nodes.
 */
export interface TocItem {
  id: string;
  level: number;
  text: string;
}

interface NodeLike {
  type?: string;
  attrs?: Record<string, unknown>;
  text?: string;
  content?: NodeLike[];
  marks?: Array<{ type?: string }>;
}

const sanitizeId = (raw: string, used: Set<string>): string => {
  const base =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "") || "section";

  let id = base;
  let i = 2;
  while (used.has(id)) {
    id = `${base}-${i++}`;
  }
  used.add(id);
  return id;
};

const collectText = (node: NodeLike): string => {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (!node.content || node.content.length === 0) return "";
  return node.content.map((child) => collectText(child)).join("");
};

export const buildTableOfContents = (
  doc: NodeLike | null | undefined,
): TocItem[] => {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
    return [];
  }
  const used = new Set<string>();
  const items: TocItem[] = [];

  const visit = (node: NodeLike): void => {
    if (node?.type === "heading" && node.attrs) {
      const level = Number(node.attrs.level ?? 2);
      const text = collectText(node).trim();
      if (text) {
        items.push({
          id: sanitizeId(text, used),
          level,
          text,
        });
      }
    }

    if (Array.isArray(node?.content)) {
      for (const child of node.content) {
        visit(child);
      }
    }
  };

  visit(doc);
  return items;
};
