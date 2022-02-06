export type Effect = () => Promise<unknown>;

export type BaseData = Record<string, unknown>;

export interface SSEContext<T extends BaseData = BaseData> {
  requests: Promise<unknown>[];
  data: T;
  collectData(): Promise<T>;
}
