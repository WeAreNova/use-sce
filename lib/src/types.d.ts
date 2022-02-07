export type Effect<T extends BaseData> = () => Promise<T>;

export interface BaseData {
  [key: string]: unknown;
}

export interface SSEContext<T extends BaseData = BaseData> {
  data: T;
}
