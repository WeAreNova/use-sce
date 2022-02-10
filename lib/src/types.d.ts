export type Effect<E extends unknown = unknown, T = unknown> = (extra?: E) => Promise<T>;

export interface BaseData {
  [key: string]: unknown;
}

export interface BrowserContextValue<T extends BaseData = BaseData> {
  data: T;
}

export interface ServerContextValue<T extends BaseData = BaseData> extends BrowserContextValue<T> {
  requests: Promise<unknown>[];
  helper?: unknown;
}
