import { LoginMapper } from '../login.mapper';

describe('LoginMapper', () => {
  it('should map token to LoginResponse', () => {
    // Given
    const token = 'sample-token';

    // When
    const response = LoginMapper.fromDomain(token);

    // Then
    expect(response).toEqual({
      token: 'sample-token',
    });
  });
});
