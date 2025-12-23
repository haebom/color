"use client";

import { useEffect, useState } from "react";

import type { JSX, ReactNode } from "react";

export default function ClientOnly({ children }: { children: ReactNode }): JSX.Element | null {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
