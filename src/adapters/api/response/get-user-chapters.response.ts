import { ApiProperty } from '@nestjs/swagger';

export class LessonSummaryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isUnlocked: boolean;

  @ApiProperty()
  completedModules: number;

  @ApiProperty()
  totalModules: number;

  @ApiProperty({ nullable: true })
  gameModuleId: string | null;

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    isUnlocked: boolean,
    completedModules: number,
    totalModules: number,
    gameModuleId: string | null = null,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.isUnlocked = isUnlocked;
    this.completedModules = completedModules;
    this.totalModules = totalModules;
    this.gameModuleId = gameModuleId;
  }
}

export class ChapterSummaryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isUnlocked: boolean;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty({ type: [LessonSummaryResponse] })
  lessons: LessonSummaryResponse[];

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    isUnlocked: boolean,
    completedLessons: number,
    totalLessons: number,
    lessons: LessonSummaryResponse[],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.isUnlocked = isUnlocked;
    this.completedLessons = completedLessons;
    this.totalLessons = totalLessons;
    this.lessons = lessons;
  }
}

export class GetUserChaptersResponse {
  @ApiProperty({ type: [ChapterSummaryResponse] })
  chapters: ChapterSummaryResponse[];

  constructor(chapters: ChapterSummaryResponse[]) {
    this.chapters = chapters;
  }
}
