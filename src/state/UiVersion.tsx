import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { setUiVersionPref, type UiVersion } from '../data/prefs';

type Ctx = { uiVersion: UiVersion; setUiVersion: (v: UiVersion) => void };

const UiVersionCtx = createContext<Ctx | null>(null);

export function UiVersionProvider({
  initial,
  children,
}: {
  initial: UiVersion;
  children: React.ReactNode;
}) {
  const [uiVersion, setUiVersionState] = useState<UiVersion>(initial);

  const setUiVersion = useCallback((v: UiVersion) => {
    setUiVersionState(v);
    setUiVersionPref(v);
  }, []);

  const value = useMemo(() => ({ uiVersion, setUiVersion }), [uiVersion, setUiVersion]);

  return <UiVersionCtx.Provider value={value}>{children}</UiVersionCtx.Provider>;
}

export function useUiVersion() {
  const v = useContext(UiVersionCtx);
  if (!v) throw new Error('useUiVersion must be used within UiVersionProvider');
  return v;
}

export function useUiVersionOptional(): UiVersion | null {
  return useContext(UiVersionCtx)?.uiVersion ?? null;
}
