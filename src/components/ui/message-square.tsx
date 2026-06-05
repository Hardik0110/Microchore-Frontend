"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn, useAnimatedIcon } from "../../lib/ui-utils";
import type { AnimatedIconHandle } from "../../lib/ui-utils";

export type MessageSquareIconHandle = AnimatedIconHandle;

interface MessageSquareIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const BUBBLE_VARIANTS: Variants = {
  normal: { y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  animate: {
    y: [0, -2, 0],
    transition: { duration: 0.55, ease: "easeInOut", times: [0, 0.45, 1] },
  },
};

const MessageSquareIcon = forwardRef<MessageSquareIconHandle, MessageSquareIconProps>(
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
          <motion.path
            animate={controls}
            variants={BUBBLE_VARIANTS}
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
      </div>
    );
  }
);

MessageSquareIcon.displayName = "MessageSquareIcon";

export { MessageSquareIcon };
