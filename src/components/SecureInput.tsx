"use client";

import React, { useState } from "react";

import type { JSX } from "react";

export interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Enable toggling visibility of the input content. */
  enableMasking?: boolean;
}

/**
 * SecureInput provides enhanced security features:
 * - Masking support (password type toggle)
 * - Copy protection
 * - Autocomplete disabled
 */
export default function SecureInput({ 
  enableMasking, 
  className, 
  type = "text",
  ...props 
}: SecureInputProps): JSX.Element {
  const [isMasked, setIsMasked] = useState<boolean>(!!enableMasking);

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={isMasked ? "password" : type}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onCopy={handleCopy}
        className={`${className} ${enableMasking ? "pr-10" : ""}`}
      />
      {enableMasking ? (
        <button
          type="button"
          onClick={() => setIsMasked(!isMasked)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
          aria-label={isMasked ? "Show content" : "Hide content"}
        >
          {isMasked ? "Show" : "Hide"}
        </button>
      ) : null}
    </div>
  );
}
