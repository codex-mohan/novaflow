import { useEffect, useState } from "react";
import katex from "katex";

export const useKaTeX = (content: string) => {
  const [renderedContent, setRenderedContent] = useState<string | null>(null);

  useEffect(() => {
    const render = () => {
      try {
        const rendered = katex.renderToString(content, {
          throwOnError: false,
        });
        setRenderedContent(rendered);
      } catch (error) {
        console.error("KaTeX rendering error:", error);
      }
    };

    render();
  }, [content]);

  return renderedContent;
};
