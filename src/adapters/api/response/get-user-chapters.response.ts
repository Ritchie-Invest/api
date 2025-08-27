import { ApiProperty } from '@nestjs/swagger';
import { ChapterStatus } from '../../../core/domain/type/ChapterStatus';
import { LessonStatus } from '../../../core/domain/type/LessonStatus';

export class LessonSummaryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ enum: LessonStatus })
  status: LessonStatus;

  @ApiProperty({ nullable: true })
  gameModuleId: string | null;

  constructor(
    id: string,
    title: string,
    description: string,
    order: number,
    status: LessonStatus,
    gameModuleId: string | null = null,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.status = status;
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

  @ApiProperty({ enum: ChapterStatus })
  status: ChapterStatus;

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
    status: ChapterStatus,
    completedLessons: number,
    totalLessons: number,
    lessons: LessonSummaryResponse[],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.order = order;
    this.status = status;
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
