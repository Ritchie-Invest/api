import { BadgeType } from '../type/BadgeType';

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  iconPath: string;
  description?: string;
}
