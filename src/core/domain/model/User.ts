import { DomainModel } from '../../base/domain-model';
import { UserType } from '../type/UserType';

export class User extends DomainModel {
  private static readonly INITIAL_XP = 0;
  private static readonly INITIAL_XP_THRESHOLD = 10;
  private static readonly PROGRESSION_STEP = 5;

  email: string;
  password: string;
  type: UserType;
  updatedAt: Date;
  createdAt: Date;
  xp: number;

  constructor(
    id: string,
    email: string,
    password: string,
    type: UserType,
    xp?: number,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);
    this.email = email;
    this.password = password;
    this.type = type;
    this.xp = xp || User.INITIAL_XP;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }

  get level(): number {
    const currentXp = this.xp || User.INITIAL_XP;
    if (currentXp < User.INITIAL_XP_THRESHOLD) return 1;

    const xpSinceLevel2 = currentXp - User.INITIAL_XP_THRESHOLD;
    const discriminant = Math.sqrt(
      1 + (8 * xpSinceLevel2) / User.PROGRESSION_STEP,
    );
    const levelIndex = Math.floor((discriminant - 1) / 2);

    return levelIndex + 2;
  }
}
