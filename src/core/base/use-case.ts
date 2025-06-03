export interface UseCase<Command, Output> {
  execute(command: Command): Promise<Output> | Output;
}
