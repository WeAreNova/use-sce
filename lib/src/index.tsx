import React, { createContext, ProviderProps, useContext, useEffect, useMemo } from "react";
import { useServerContext } from "server";
import type { BaseData, Effect, SCEContext as BrowserContextValue } from "types";

const BrowserContext = createContext<BrowserContextValue<any>>({ data: {} });
export function BrowserSCE<T extends BaseData>(props: ProviderProps<BrowserContextValue<T>>) {
  return <BrowserContext.Provider {...props} />;
}

function useBrowserContext<T extends BaseData>() {
  return useContext<BrowserContextValue<T>>(BrowserContext);
}

export function usePreloadedState<T extends BaseData>(
  preloadedKey: keyof T | undefined,
): typeof preloadedKey extends undefined ? T : T[string & typeof preloadedKey] {
  const context = typeof window === "undefined" ? useServerContext<T>() : useBrowserContext<T>();
  return useMemo(
    () =>
      (preloadedKey ? context.data[preloadedKey as string] : context.data) as typeof preloadedKey extends undefined
        ? T
        : T[string & typeof preloadedKey],
    [],
  );
}

async function serverSideEffect<T extends Effect<BaseData>>(
  effect: T,
  { context, preloadedKey }: { context: BrowserContextValue; preloadedKey?: string },
) {
  const res = await effect();
  if (preloadedKey) context.data[preloadedKey] = res;
}

function useSCEffect<R extends BaseData, T extends Effect<R>>(effect: T, deps: any[], preloadedKey?: string & keyof R) {
  const clientContext = useBrowserContext<R>();
  const serverContext = useServerContext<R>();

  if (typeof window === "undefined") {
    serverContext.requests.push(serverSideEffect(effect, { context: serverContext, preloadedKey }));
  }

  useEffect(() => {
    effect();
  }, deps);

  if (preloadedKey) return clientContext.data?.[preloadedKey];
}

export default useSCEffect;
