import { DomainModel } from '../../base/domain-model';
import { UserType } from '../type/UserType';

export class User extends DomainModel {
  private static readonly INITIAL_XP = 0;
  private static readonly INITIAL_XP_THRESHOLD = 10;
  private static readonly PROGRESSION_STEP = 5;

  email: string;
  password: string;
  type: UserType;
  totalXp: number;
  isInvestmentUnlocked: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    email: string,
    password: string,
    type: UserType,
    totalXp?: number,
    isInvestmentUnlocked?: boolean,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);
    this.email = email;
    this.password = password;
    this.type = type;
    this.totalXp = totalXp || User.INITIAL_XP;
    this.isInvestmentUnlocked = isInvestmentUnlocked || false;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }

  get level(): number {
    return this.computeProgress().levelIndex + 1;
  }

  // Width needed to complete the current level segment (XP Needed For Next Level in table)
  get xpRequiredForNextLevel(): number {
    const { levelIndex } = this.computeProgress();
    return User.widthForLevelIndex(levelIndex);
  }

  // XP already accumulated in the current level segment (xpForThisLevel in table)
  get xpForThisLevel(): number {
    return this.computeProgress().xpInLevel;
  }

  // Remaining XP to reach the next level boundary
  get xpToNextLevel(): number {
    const { levelIndex, xpInLevel } = this.computeProgress();
    const width = User.widthForLevelIndex(levelIndex);
    return Math.max(0, width - xpInLevel);
  }

  private static widthForLevelIndex(index: number): number {
    // width(0)=10, width(1)=15, width(2)=25, width(3)=40, ...
    const t = (index * (index + 1)) / 2; // triangular number T(index)
    return User.INITIAL_XP_THRESHOLD + User.PROGRESSION_STEP * t;
  }

  private computeProgress(): { levelIndex: number; xpInLevel: number } {
    let idx = 0; // 0-based index for widths (table Level)
    let remaining = this.totalXp || User.INITIAL_XP;

    while (remaining >= User.widthForLevelIndex(idx)) {
      remaining -= User.widthForLevelIndex(idx);
      idx += 1;
    }

    return { levelIndex: idx, xpInLevel: remaining };
  }
}
