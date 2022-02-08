export type Effect<T extends BaseData> = () => Promise<T>;

export interface BaseData {
  [key: string]: unknown;
}

export interface SCEContext<T extends BaseData = BaseData> {
  data: T;
}
