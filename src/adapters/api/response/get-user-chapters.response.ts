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
  is_unlocked: boolean;

  @ApiProperty()
  completed_modules: number;

  @ApiProperty()
  total_modules: number;

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    is_unlocked: boolean,
    completed_modules: number,
    total_modules: number,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.is_unlocked = is_unlocked;
    this.completed_modules = completed_modules;
    this.total_modules = total_modules;
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
  is_unlocked: boolean;

  @ApiProperty()
  completed_lessons: number;

  @ApiProperty()
  total_lessons: number;

  @ApiProperty({ type: [LessonSummaryResponse] })
  lessons: LessonSummaryResponse[];

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    is_unlocked: boolean,
    completed_lessons: number,
    total_lessons: number,
    lessons: LessonSummaryResponse[],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.is_unlocked = is_unlocked;
    this.completed_lessons = completed_lessons;
    this.total_lessons = total_lessons;
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
