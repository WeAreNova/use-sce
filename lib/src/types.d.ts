export type Effect<T> = () => Promise<T>;

export interface BaseData {
  [key: string]: unknown;
}

export interface BrowserContextValue<T extends BaseData = BaseData> {
  data: T;
}
