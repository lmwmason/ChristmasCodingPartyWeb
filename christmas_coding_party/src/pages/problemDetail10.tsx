import React from "react";
import ReactMarkdown from "react-markdown";

export default function Blog() {
    const markdownText = `
  # Fucking!
  세상 **fucking** 하네요...
  `;

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "768px", width: "100%" }}>
                <ReactMarkdown>
                    {markdownText}
                </ReactMarkdown>
            </div>
        </div>
    );
}