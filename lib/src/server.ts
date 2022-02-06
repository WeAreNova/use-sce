import React, { useContext } from "react";
import { BaseData, SSEContext } from "./types";

export function createContext<T extends BaseData>(): SSEContext<T> {
  return {
    requests: [],
    data: {} as T,
    async collectData() {
      await Promise.all(this.requests);
      return this.data;
    },
  };
}

const SSE = React.createContext<SSEContext>({
  requests: [],
  data: {},
  collectData: () => Promise.resolve({}),
});

export function useServerContext() {
  return useContext(SSE);
}

export const SSEProvider = SSE.Provider;
