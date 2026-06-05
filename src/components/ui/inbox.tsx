"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn, useAnimatedIcon } from "../../lib/ui-utils";
import type { AnimatedIconHandle } from "../../lib/ui-utils";

export type InboxIconHandle = AnimatedIconHandle;

interface InboxIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const FLAP_VARIANTS: Variants = {
  normal: { y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  animate: {
    y: [0, -3, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

const InboxIcon = forwardRef<InboxIconHandle, InboxIconProps>(
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
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          <motion.path
            animate={controls}
            variants={FLAP_VARIANTS}
            d="M12 7v6"
          />
        </svg>
      </div>
    );
  }
);

InboxIcon.displayName = "InboxIcon";

export { InboxIcon };
