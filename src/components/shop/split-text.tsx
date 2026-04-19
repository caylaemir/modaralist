"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: keyof HTMLElementTagNameMap;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  const Component = motion[Tag as "h2"];

  return (
    <Component ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-flex overflow-hidden align-baseline"
          style={{ marginRight: "0.25em" }}
        >
          <motion.span
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : { y: "110%" }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + wi * stagger,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
