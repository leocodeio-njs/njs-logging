import { Injectable, Scope } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.DEFAULT })
export class CorrelationService {
  private readonly asyncLocalStorage: AsyncLocalStorage<string>;

  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<string>();
  }

  getCorrelationId(): string {
    return this.asyncLocalStorage.getStore() || 'no-correlation-id';
  }

  run(correlationId: string, callback: () => any) {
    return this.asyncLocalStorage.run(correlationId, callback);
  }

  generateCorrelationId(): string {
    return `${Date.now()}-${uuidv4()}`;
  }
}
