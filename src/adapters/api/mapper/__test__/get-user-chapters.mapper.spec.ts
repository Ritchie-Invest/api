import { GetUserProgressMapper } from '../get-user-progress.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { GetUserProgressResult } from '../../../../core/usecases/get-user-progress-use-case.service';
import { ChapterStatus } from '../../../../core/domain/type/ChapterStatus';
import { LessonStatus } from '../../../../core/domain/type/LessonStatus';

describe('GetUserProgressMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest to GetUserProgressCommand', () => {
      // Given
      const profileRequest: ProfileRequest = {
        id: 'user-123',
        email: 'test@example.com',
        type: UserType.STUDENT,
      };
      // When
      const result = GetUserProgressMapper.toDomain(profileRequest);
      // Then
      expect(result).toStrictEqual({ userId: 'user-123' });
    });
  });

  describe('fromDomain', () => {
    it('should map a single chapter with multiple lessons', () => {
      // Given
      const domainResult: GetUserProgressResult = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          description: 'Desc C1',
          order: 1,
          status: ChapterStatus.IN_PROGRESS,
          completedLessons: 1,
          totalLessons: 2,
          lessons: [
            {
              id: 'lesson-1',
              title: 'Lesson 1',
              description: 'Desc L1',
              order: 1,
              status: LessonStatus.COMPLETED,
              gameModuleId: 'module-1',
            },
            {
              id: 'lesson-2',
              title: 'Lesson 2',
              description: 'Desc L2',
              order: 2,
              status: LessonStatus.UNLOCKED,
              gameModuleId: 'module-2',
            },
          ],
        },
      ];
      // When
      const response = GetUserProgressMapper.fromDomain(domainResult);
      // Then
      expect(response).toEqual({
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            description: 'Desc C1',
            order: 1,
            status: ChapterStatus.IN_PROGRESS,
            completedLessons: 1,
            totalLessons: 2,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                description: 'Desc L1',
                order: 1,
                status: LessonStatus.COMPLETED,
                gameModuleId: 'module-1',
              },
              {
                id: 'lesson-2',
                title: 'Lesson 2',
                description: 'Desc L2',
                order: 2,
                status: LessonStatus.UNLOCKED,
                gameModuleId: 'module-2',
              },
            ],
          },
        ],
      });
    });

    it('should map lesson with null gameModuleId', () => {
      // Given
      const domainResult: GetUserProgressResult = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          description: 'Desc C1',
          order: 1,
          status: ChapterStatus.UNLOCKED,
          completedLessons: 0,
          totalLessons: 1,
          lessons: [
            {
              id: 'lesson-1',
              title: 'Lesson 1',
              description: 'Desc L1',
              order: 1,
              status: LessonStatus.UNLOCKED,
              gameModuleId: null,
            },
          ],
        },
      ];
      // When
      const response = GetUserProgressMapper.fromDomain(domainResult);
      // Then
      expect(response).toEqual({
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            description: 'Desc C1',
            order: 1,
            status: ChapterStatus.UNLOCKED,
            completedLessons: 0,
            totalLessons: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                description: 'Desc L1',
                order: 1,
                status: LessonStatus.UNLOCKED,
                gameModuleId: null,
              },
            ],
          },
        ],
      });
    });

    it('should map multiple chapters and lessons preserving order', () => {
      // Given
      const domainResult: GetUserProgressResult = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          description: 'Desc C1',
          order: 1,
          status: ChapterStatus.COMPLETED,
          completedLessons: 2,
          totalLessons: 2,
          lessons: [
            {
              id: 'lesson-1',
              title: 'Lesson 1',
              description: 'Desc L1',
              order: 1,
              status: LessonStatus.COMPLETED,
              gameModuleId: 'module-1',
            },
            {
              id: 'lesson-2',
              title: 'Lesson 2',
              description: 'Desc L2',
              order: 2,
              status: LessonStatus.COMPLETED,
              gameModuleId: 'module-2',
            },
          ],
        },
        {
          id: 'chapter-2',
          title: 'Chapter 2',
          description: 'Desc C2',
          order: 2,
          status: ChapterStatus.LOCKED,
          completedLessons: 0,
          totalLessons: 1,
          lessons: [
            {
              id: 'lesson-3',
              title: 'Lesson 3',
              description: 'Desc L3',
              order: 1,
              status: LessonStatus.LOCKED,
              gameModuleId: 'module-3',
            },
          ],
        },
      ];
      // When
      const response = GetUserProgressMapper.fromDomain(domainResult);
      // Then
      expect(response).toEqual({
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            description: 'Desc C1',
            order: 1,
            status: ChapterStatus.COMPLETED,
            completedLessons: 2,
            totalLessons: 2,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                description: 'Desc L1',
                order: 1,
                status: LessonStatus.COMPLETED,
                gameModuleId: 'module-1',
              },
              {
                id: 'lesson-2',
                title: 'Lesson 2',
                description: 'Desc L2',
                order: 2,
                status: LessonStatus.COMPLETED,
                gameModuleId: 'module-2',
              },
            ],
          },
          {
            id: 'chapter-2',
            title: 'Chapter 2',
            description: 'Desc C2',
            order: 2,
            status: ChapterStatus.LOCKED,
            completedLessons: 0,
            totalLessons: 1,
            lessons: [
              {
                id: 'lesson-3',
                title: 'Lesson 3',
                description: 'Desc L3',
                order: 1,
                status: LessonStatus.LOCKED,
                gameModuleId: 'module-3',
              },
            ],
          },
        ],
      });
    });

    it('should fallback lesson order to 0 when undefined', () => {
      // Given
      const domainResult = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          description: 'Desc C1',
          order: 5,
          status: ChapterStatus.UNLOCKED,
          completedLessons: 0,
          totalLessons: 1,
          lessons: [
            {
              id: 'lesson-1',
              title: 'Lesson 1',
              description: 'Desc L1',
              order: undefined,
              status: LessonStatus.UNLOCKED,
              gameModuleId: 'module-x',
            },
          ],
        },
      ] as unknown as GetUserProgressResult;
      // When
      const response = GetUserProgressMapper.fromDomain(domainResult);
      // Then
      expect(response).toEqual({
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            description: 'Desc C1',
            order: 5,
            status: ChapterStatus.UNLOCKED,
            completedLessons: 0,
            totalLessons: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                description: 'Desc L1',
                order: 0,
                status: LessonStatus.UNLOCKED,
                gameModuleId: 'module-x',
              },
            ],
          },
        ],
      });
    });
  });
});
