export type DomainEvent = Record<string, unknown>;

export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  eventName: string;
  handle(event: T): Promise<void> | void;
}

export interface DomainEventPublisher {
  publish<T extends DomainEvent>(eventName: string, event: T): Promise<void>;
  register(handler: DomainEventHandler): void;
}
