import { BadgeDefinition } from '../model/BadgeDefinition';
import { BadgeType } from '../type/BadgeType';

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    type: BadgeType.LEARN_PERFECT_QUIZ,
    name: 'Perfect Quiz',
    description: 'Score 100% on a lesson quiz.',
  },
  {
    type: BadgeType.PROG_5_LESSONS,
    name: '5 Lessons',
    description: 'Complete 5 lessons.',
  },
  {
    type: BadgeType.PROG_FIRST_CHAPTER,
    name: 'First Chapter',
    description: 'Complete all lessons in a chapter.',
  },
  {
    type: BadgeType.PROG_50_PERCENT,
    name: 'Halfway There',
    description: 'Complete 50% of all lessons.',
  },
];
