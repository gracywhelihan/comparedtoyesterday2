import { useLayoutEffect, useRef } from "react";

/**
 * A headline that exactly fills the width of the page.
 *
 * Text width grows in proportion to font size, so: set a test size (100px),
 * measure, then scale — newSize = 100 × (available width ÷ measured width).
 * Re-fits when the text, the window width, or the web font changes.
 */
export function Headline({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const measured = el.getBoundingClientRect().width;
      if (measured > 0) el.style.fontSize = `${(100 * box.clientWidth) / measured}px`;
    };
    fit();
    document.fonts.ready.then(fit); // measure again once Archivo has loaded
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [text]);

  return (
    <h1 className="headline">
      <span ref={ref}>{text}</span>
    </h1>
  );
}
