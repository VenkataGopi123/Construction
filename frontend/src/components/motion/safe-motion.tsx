"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Motion wrapper that avoids SSR invisible content (opacity: 0 stuck without hydration).
 */
export function SafeMotionDiv({
  initial,
  animate,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <motion.div
      initial={ready ? initial : false}
      animate={ready ? animate : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SafeMotionHeader({
  initial,
  animate,
  children,
  ...props
}: HTMLMotionProps<"header">) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <motion.header
      initial={ready ? initial : false}
      animate={ready ? animate : undefined}
      {...props}
    >
      {children}
    </motion.header>
  );
}
