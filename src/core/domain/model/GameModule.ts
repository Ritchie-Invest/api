export abstract class GameModule {
  id: string;
  lessonId: string;
  updatedAt: Date;
  createdAt: Date;

  protected constructor(params: {
    id: string;
    lessonId: string;
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.lessonId = params.lessonId;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
