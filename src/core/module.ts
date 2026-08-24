export interface SparePartsModule {
  readonly id: string;
  activate(): void | Promise<void>;
  dispose(): void | Promise<void>;
}

export interface SparePartsClient {
  register(module: SparePartsModule): () => void;
  activate(): Promise<void>;
  dispose(): Promise<void>;
}
