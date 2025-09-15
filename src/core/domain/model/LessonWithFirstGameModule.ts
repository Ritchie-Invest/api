import { DomainModel } from '../../base/domain-model';

export class LessonWithFirstGameModule extends DomainModel {
  public readonly title: string;
  public readonly description: string;
  public readonly order: number;
  public readonly isCompleted: boolean;
  public readonly gameModuleId: string | null;

  constructor(params: {
    id: string;
    title: string;
    description: string;
    order: number;
    isCompleted?: boolean;
    gameModuleId: string | null;
  }) {
    super(params.id);
    this.title = params.title;
    this.description = params.description;
    this.order = params.order;
    this.isCompleted = params.isCompleted || false;
    this.gameModuleId = params.gameModuleId;
  }
}
