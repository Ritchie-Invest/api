import { BadgeDefinition } from '../model/BadgeDefinition';
import { BadgeType } from '../type/BadgeType';

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    type: BadgeType.LEARN_PERFECT_QUIZ,
    name: 'Perfect Quiz',
    iconPath: '/badges/learn_perfect_quiz.svg',
    description: 'Score 100% on a lesson quiz.',
  },
  {
    type: BadgeType.PROG_5_LESSONS,
    name: '5 Lessons',
    iconPath: '/badges/prog_5_lessons.svg',
    description: 'Complete 5 lessons.',
  },
  {
    type: BadgeType.PROG_FIRST_CHAPTER,
    name: 'First Chapter',
    iconPath: '/badges/prog_first_chapter.svg',
    description: 'Complete all lessons in a chapter.',
  },
  {
    type: BadgeType.PROG_50_PERCENT,
    name: 'Halfway There',
    iconPath: '/badges/prog_50_percent.svg',
    description: 'Complete 50% of all lessons.',
  },
];
