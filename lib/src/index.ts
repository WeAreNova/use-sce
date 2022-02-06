import { useEffect } from "react";
import { useServerContext } from "server";
import type { Effect, SSEContext } from "types";

async function resolveServerSide<T extends Effect>(
  effect: T,
  { context, preloadedKey }: { context: SSEContext; preloadedKey?: string },
) {
  const res = await effect();
  if (preloadedKey) context.data[preloadedKey] = res;
}

function useSSE<T extends Effect>(effect: T, deps: any[], preloadedKey?: string) {
  const context = useServerContext();
  if (typeof window === "undefined") context.requests.push(resolveServerSide(effect, { context, preloadedKey }));
  useEffect(() => {
    effect();
  }, deps);
}

// export async function collectState(tree: ReactNode) {
//   const context = { requests: [] as Promise<unknown>[] };
//   React.createElement(SSEContext.Provider, { value: context }, tree);
//   await Promise.all(context.requests);
//   return tree;
// }

export default useSSE;
