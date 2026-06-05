"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn, useAnimatedIcon } from "../../lib/ui-utils";
import type { AnimatedIconHandle } from "../../lib/ui-utils";

export type ClipboardCheckIconHandle = AnimatedIconHandle;

interface ClipboardCheckIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const CHECK_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

const ClipboardCheckIcon = forwardRef<ClipboardCheckIconHandle, ClipboardCheckIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const { controls, handleMouseEnter, handleMouseLeave } = useAnimatedIcon(
      ref,
      onMouseEnter,
      onMouseLeave
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <motion.path animate={controls} variants={CHECK_VARIANTS} d="m9 14 2 2 4-4" />
        </svg>
      </div>
    );
  }
);

ClipboardCheckIcon.displayName = "ClipboardCheckIcon";

export { ClipboardCheckIcon };
