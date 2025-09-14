import { BadgeType } from '../type/BadgeType';

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description?: string;
}
