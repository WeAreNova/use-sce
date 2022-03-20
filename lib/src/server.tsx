import React, { ProviderProps, ReactElement, useContext } from "react";
import { renderToString } from "react-dom/server";
import type { BaseData, ServerContextValue } from "types";

const ServerContext = React.createContext<ServerContextValue<any>>({ requests: [], data: {} });
ServerContext.displayName = "SCEContext";
/**
 * A functional component to handle the set-up of the server preloaded-state context.
 *
 * This allows the preloaded state to be accessible via the `usePreloadedState` hook on the server.
 */
function ServerSCE<T extends BaseData>(props: ProviderProps<ServerContextValue<T>>) {
  return <ServerContext.Provider {...props} />;
}
/**
 * A function that returns the SCEContext for the server.
 * @private use the `usePreloadedState` hook instead
 * @returns the server-side context value
 */
export function useServerContext<T extends BaseData>() {
  return useContext<ServerContextValue<T>>(ServerContext);
}

interface CollectDataParams<T extends BaseData, H = unknown> {
  tree: ReactElement;
  data: Partial<T>;
  helper?: H;
}

/**
 * A function to render the react tree and collect data from server-side effects.
 * @param opts options for the `collectData` function
 * @param opts.tree the react tree to render
 * @param opts.data the object to store result of the super-charged effects
 * @param opts.helper custom helpers that enable the request server-side
 *
 * @example
 * ```tsx
 * import { collectData } from "@wearenova/use-sce/server";
 * ....
 * const preloadedData: { data: User[] } = { data: [] }; // you can provide any default or other values here
 * const html = ReactDOMServer.renderToString(
 *   await collectData({
 *     data: preloadedData, // pass in the `preloadedData` object so it can be populated with the results from the effects
 *     tree: (
 *       <StaticRouter location={req.url}>
 *         <App />
 *       </StaticRouter>
 *     ),
 *     // optionally, you can provide custom helpers that will be made available to the effect server-side
 *     helper: axios.create({
 *       baseURL: `${req.protocol}://${req.headers.host}`,
 *       headers: { Cookie: req.headers.cookie, Authorization: req.headers.authorization },
 *     }),
 *   })
 * );
 * // preloadedData.data = Array<User>
 * ```
 *
 * @returns the updated react tree with the collected data
 */
export async function collectData<T extends BaseData, H = unknown>({
  tree,
  data,
  helper,
}: CollectDataParams<T, H>): Promise<ReactElement> {
  const state: ServerContextValue = { requests: [], data, helper };
  renderToString(<ServerSCE value={state}>{tree}</ServerSCE>);
  await Promise.all(state.requests);
  Object.assign(data, state.data);
  return <ServerSCE value={state}>{tree}</ServerSCE>;
}
