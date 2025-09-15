import { User } from '../User';
import { UserType } from '../../type/UserType';

describe('User model - progression', () => {
  function makeUser(xp: number): User {
    return new User('u1', 'u@example.com', 'pwd', UserType.STUDENT, xp);
  }

  it('xp=0 → level=1, width=10, xpFor=0, toNext=10', () => {
    const user = makeUser(0);
    expect(user.level).toBe(1);
    expect(user.xpRequiredForNextLevel).toBe(10);
    expect(user.xpForThisLevel).toBe(0);
    expect(user.xpToNextLevel).toBe(10);
  });

  it('xp=11 → level=2, width=15, xpFor=1, toNext=14', () => {
    const user = makeUser(11);
    expect(user.level).toBe(2);
    expect(user.xpRequiredForNextLevel).toBe(15);
    expect(user.xpForThisLevel).toBe(1);
    expect(user.xpToNextLevel).toBe(14);
  });

  it('xp=24 → level=2, width=15, xpFor=14, toNext=1', () => {
    const user = makeUser(24);
    expect(user.level).toBe(2);
    expect(user.xpRequiredForNextLevel).toBe(15);
    expect(user.xpForThisLevel).toBe(14);
    expect(user.xpToNextLevel).toBe(1);
  });

  it('xp=28 → level=3, width=25, xpFor=3, toNext=22', () => {
    const user = makeUser(28);
    expect(user.level).toBe(3);
    expect(user.xpRequiredForNextLevel).toBe(25);
    expect(user.xpForThisLevel).toBe(3);
    expect(user.xpToNextLevel).toBe(22);
  });

  it('xp=41 → level=3, width=25, xpFor=16, toNext=9', () => {
    const user = makeUser(41);
    expect(user.level).toBe(3);
    expect(user.xpRequiredForNextLevel).toBe(25);
    expect(user.xpForThisLevel).toBe(16);
    expect(user.xpToNextLevel).toBe(9);
  });
});
