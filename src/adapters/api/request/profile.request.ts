import { UserType } from '../../../core/domain/type/UserType';

export type ProfileRequest = {
  id: string;
  email: string;
  type: UserType;
};
