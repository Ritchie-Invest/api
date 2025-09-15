import {
  DomainEvent,
  DomainEventHandler,
  DomainEventPublisher,
} from '../../core/base/domain-event';

export class InMemoryDomainEventBus implements DomainEventPublisher {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    const list = this.handlers.get(eventName) || [];
    for (const handler of list) {
      await handler.handle(event as any);
    }
  }

  register<T extends DomainEvent>(handler: DomainEventHandler<T>): void {
    const list = this.handlers.get(handler.eventName) || [];
    list.push(handler);
    this.handlers.set(handler.eventName, list);
  }
}
