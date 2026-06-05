"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn, useAnimatedIcon } from "../../lib/ui-utils";
import type { AnimatedIconHandle } from "../../lib/ui-utils";

export type LogoutIconHandle = AnimatedIconHandle;

interface LogoutIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const PATH_VARIANTS: Variants = {
  normal: {
    x: 0,
    translateX: 0,
    transition: {
      duration: 0.2,
    },
  },
  animate: {
    x: 2,
    translateX: [0, -3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const LogoutIcon = forwardRef<LogoutIconHandle, LogoutIconProps>(
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <motion.polyline
            animate={controls}
            initial="normal"
            points="16 17 21 12 16 7"
            variants={PATH_VARIANTS}
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={PATH_VARIANTS}
            x1="21"
            x2="9"
            y1="12"
            y2="12"
          />
        </svg>
      </div>
    );
  }
);

LogoutIcon.displayName = "LogoutIcon";

export { LogoutIcon };
