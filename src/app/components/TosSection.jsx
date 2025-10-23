import React from "react";
import styles from "./TosSection.module.css";

// Accepts either HTML string or lexical JSON
export default function TosSection({ content = "" }) {
  // If content is lexical JSON, convert to HTML
  let html = "";
  if (typeof content === "object" && content !== null && content.type === "root") {
    html = lexicalToHtml(content);
  } else if (typeof content === "string") {
    html = content;
  }
  if (!html || html.trim() === "") return null;
  return (
    <section className="mb-12">
      {/* Header like the original design */}
      <div className="border-t-4 border-blue-500 pt-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-6">
          By engaging with State101 Travel, you agree to the following terms and conditions.
        </p>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}

function lexicalToHtml(root) {
  if (!root || !Array.isArray(root.children)) return "";
  return root.children.map(renderLexicalNode).join("");
}
function renderLexicalNode(node) {
  if (!node) return "";
  if (node.type === "paragraph") {
    const text = (node.children || []).map(renderLexicalNode).join("");
    return text.trim() ? `<p>${text}</p>` : "";
  }
  if (node.type === "heading") {
    const level = node.tag || node.level || 2;
    const inner = (node.children || []).map(renderLexicalNode).join("");
    return `<h${level}>${inner}</h${level}>`;
  }
  if (node.type === "list") {
    const isOrdered = node.listType === 'number' || node.tag === 'ol' || node.ordered;
    const items = (node.children || []).map(renderLexicalNode).join("");
    return isOrdered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
  }
  if (node.type === "listitem") {
    const inner = (node.children || []).map(renderLexicalNode).join("");
    return `<li>${inner}</li>`;
  }
  if (node.type === "text") {
    let t = node.text || "";
    if (node.format & 1) t = `<strong>${t}</strong>`; // bold
    if (node.format & 2) t = `<em>${t}</em>`; // italic
    return t;
  }
  return "";
}
