import React, { ProviderProps, ReactElement, useContext } from "react";
import { renderToString } from "react-dom/server";
import type { BaseData, BrowserContextValue } from "types";

interface ServerContextValue<T extends BaseData> extends BrowserContextValue<T> {
  requests: Promise<unknown>[];
}
const ServerContext = React.createContext<ServerContextValue<any>>({ requests: [], data: {} });
/**
 * A functional component to handle the set-up of the server preloaded-state context.
 *
 * This allows the preloaded state to be accessible via the `usePreloadedState` hook on the server.
 */
export function ServerSCE<T extends BaseData>(props: ProviderProps<ServerContextValue<T>>) {
  return <ServerContext.Provider {...props} />;
}
/**
 * A function that returns the SSEContext for the server.
 * @private use the `usePreloadedState` hook instead
 * @returns the server-side context value
 */
export function useServerContext<T extends BaseData>() {
  return useContext<ServerContextValue<T>>(ServerContext);
}

/**
 * A function to render the react tree and collect data from server-side effects.
 * @param tree the react tree to render
 * @returns the updated react tree with the collected data
 */
export async function collectData<T extends BaseData>(tree: ReactElement, data: Partial<T>): Promise<ReactElement> {
  const state = {
    requests: [],
    data: {} as T,
  };
  renderToString(<ServerSCE value={state}>{tree}</ServerSCE>);
  await Promise.all(state.requests);
  Object.assign(data, state.data);
  return <ServerSCE value={state}>{tree}</ServerSCE>;
}
