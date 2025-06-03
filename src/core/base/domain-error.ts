export class DomainError extends Error {
  constructor(public override readonly message: string) {
    super(message);
  }
}
