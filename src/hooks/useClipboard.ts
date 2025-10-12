// Reason: Clipboard helper to provide copy actions with graceful fallback.
import { useCallback, useState } from "react";

export interface ClipboardResult {
  /** Copy with boolean result (backward-compat). */
  copy: (text: string) => Promise<boolean>;
  /** New API: write resolves on success, rejects on failure. */
  write: (text: string) => Promise<void>;
  /** Flag to allow UI to show transient state. */
  copied: boolean;
}

/**
 * useClipboard returns copy()/write() methods and a copied flag.
 * - write(text) resolves on success and rejects on failure
 * - copy(text) returns boolean for existing callers
 */
export function useClipboard(): ClipboardResult {
  const [copied, setCopied] = useState<boolean>(false);

  const doWrite = useCallback(async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await doWrite(text);
      return true;
    } catch {
      return false;
    }
  }, [doWrite]);

  return { copy, write: doWrite, copied };
}