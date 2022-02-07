import React, { createContext, ProviderProps, useContext, useEffect, useMemo } from "react";
import { useServerContext } from "server";
import type { BaseData, Effect, SSEContext } from "types";

const ClientSSEContext = createContext<SSEContext<any>>({ data: {} });
export function ClientSSEProvider<T extends BaseData>(props: ProviderProps<SSEContext<T>>) {
  return <ClientSSEContext.Provider {...props} />;
}

function useClientContext<T extends BaseData>() {
  return useContext<SSEContext<T>>(ClientSSEContext);
}

export function usePreloadedState<T extends BaseData>(
  preloadedKey: keyof T | undefined,
): typeof preloadedKey extends undefined ? T : T[string & typeof preloadedKey] {
  const context = typeof window === "undefined" ? useServerContext<T>() : useClientContext<T>();
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
  { context, preloadedKey }: { context: SSEContext; preloadedKey?: string },
) {
  const res = await effect();
  if (preloadedKey) context.data[preloadedKey] = res;
}

function useSSE<R extends BaseData, T extends Effect<R>>(effect: T, deps: any[], preloadedKey?: string & keyof R) {
  const clientContext = useClientContext<R>();
  const serverContext = useServerContext<R>();

  if (typeof window === "undefined") {
    serverContext.requests.push(serverSideEffect(effect, { context: serverContext, preloadedKey }));
  }

  useEffect(() => {
    effect();
  }, deps);

  if (preloadedKey) return clientContext.data?.[preloadedKey];
}

export default useSSE;
