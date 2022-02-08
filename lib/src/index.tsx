import React, { createContext, ProviderProps, useContext, useEffect, useMemo } from "react";
import { useServerContext } from "server";
import type { BaseData, BrowserContextValue, Effect } from "types";

const BrowserContext = createContext<BrowserContextValue<any>>({ data: {} });
/**
 * A functional component to handle the set-up of the browser preloaded-state context.
 *
 * This allows the preloaded state to be accessible via the {@link usePreloadedState} hook in the browser.
 * @param props.value.data the preloaded state from the server
 */
export function BrowserSCE<T extends BaseData>(props: ProviderProps<BrowserContextValue<T>>) {
  return <BrowserContext.Provider {...props} />;
}

function useBrowserContext<T extends BaseData>() {
  return useContext<BrowserContextValue<T>>(BrowserContext);
}

/**
 * A hook to return the value of the preloaded state.
 * @param preloadedKey if provided, this hook will return the value at the given key in the preloaded state
 * @returns the preloaded value
 */
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

async function serverSideEffect<T extends Effect<unknown>>(
  effect: T,
  { context, preloadedKey }: { context: BrowserContextValue; preloadedKey?: string },
) {
  const res = await effect();
  if (preloadedKey) context.data[preloadedKey] = res;
}

/**
 * The **super-charged** `useEffect` hook that allows you to run effects server-side as well as in the browser.
 * @param effect the effect to run
 * @param deps effect will only activate if the values in this list changes
 * @param preloadedKey the key to store the result in the preloaded state
 * @returns `void` if `preloadedKey` is not provided, otherwise the result of the effect
 */
function useSCEffect<
  E extends Effect<unknown>,
  R extends Awaited<ReturnType<E>> | undefined,
  K extends string | undefined = undefined,
  T extends { [key in K]: R } = { [key in K]: R },
>(effect: E, deps: any[], preloadedKey?: K): K extends string ? R : void {
  const clientContext = useBrowserContext<T>();
  const serverContext = useServerContext<T>();

  if (typeof window === "undefined" && (!preloadedKey || !serverContext.data.hasOwnProperty(preloadedKey))) {
    serverContext.requests.push(serverSideEffect(effect, { context: serverContext, preloadedKey }));
  }

  useEffect(() => {
    effect();
  }, deps);

  if (preloadedKey) return clientContext.data?.[preloadedKey] as K extends string ? R : void;
}

export default useSCEffect;
