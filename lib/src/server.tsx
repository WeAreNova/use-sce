import React, { ProviderProps, ReactElement, useContext } from "react";
import { renderToString } from "react-dom/server";
import type { BaseData, SSEContext } from "types";

let data = {};

interface ServerContext<T extends BaseData> extends SSEContext<T> {
  requests: Promise<unknown>[];
}
const ServerSSEContext = React.createContext<ServerContext<any>>({ requests: [], data: {} });
export function ServerSSEProvider<T extends BaseData>(props: ProviderProps<ServerContext<T>>) {
  return <ServerSSEContext.Provider {...props} />;
}
/**
 * A function that returns the SSEContext for the server.
 * @private use the `usePreloadedState` hook instead
 * @returns the server-side context value
 */
export function useServerContext<T extends BaseData>() {
  return useContext<ServerContext<T>>(ServerSSEContext);
}

/**
 * A function to render the react tree and collect data from server-side effects.
 * @param tree the react tree to render
 * @returns the updated react tree with the collected data
 */
export async function collectData<T extends BaseData>(tree: ReactElement): Promise<ReactElement> {
  const state = {
    requests: [],
    data: {} as T,
  };
  renderToString(<ServerSSEProvider value={state}>{tree}</ServerSSEProvider>);
  await Promise.all(state.requests);
  data = { ...state.data };
  return <ServerSSEProvider value={state}>{tree}</ServerSSEProvider>;
}

/**
 * A function to return the collected data after server-side rendering.
 * @returns the collected data
 */
export function extractData<T extends BaseData>() {
  const res = { ...data };
  data = {};
  return res as T;
}
