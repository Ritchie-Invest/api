import { RefreshUseCase, RefreshCommand } from '../refresh.use-case';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token.repository';
import { TokenService } from '../../domain/service/token.service';

describe('RefreshUseCase', () => {
  let refreshTokenRepository: RefreshTokenRepository;
  let tokenService: TokenService;
  let refreshUseCase: RefreshUseCase;

  const userPayload = {
    id: 'user123',
    email: 'john.doe@example.com',
    type: 'STUDENT',
  };

  beforeEach(() => {
    refreshTokenRepository = {
      findByToken: jest.fn().mockResolvedValue({
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
      }),
      expireNow: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as RefreshTokenRepository;

    tokenService = {
      verifyRefreshToken: jest.fn().mockReturnValue(userPayload),
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('new-refresh-token'),
    } as unknown as TokenService;

    refreshUseCase = new RefreshUseCase(refreshTokenRepository, tokenService);
  });

  it('should refresh tokens if valid', async () => {
    // Given
    const command: RefreshCommand = { token: 'valid-token' };

    // When
    const result = await refreshUseCase.execute(command);

    // Then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith('valid-token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(
      'valid-token',
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(refreshTokenRepository.expireNow).toHaveBeenCalledWith(
      'valid-token',
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      userId: userPayload.id,
      token: 'new-refresh-token',
      expiresAt: expect.any(Date) as Date,
    });
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should throw if refresh token is invalid (bad signature)', async () => {
    (tokenService.verifyRefreshToken as jest.Mock).mockReturnValue(null);

    const command: RefreshCommand = { token: 'invalid-token' };
    await expect(refreshUseCase.execute(command)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
  });

  it('should throw if refresh token is missing in DB', async () => {
    (refreshTokenRepository.findByToken as jest.Mock).mockResolvedValue(null);

    const command: RefreshCommand = { token: 'missing-token' };
    await expect(refreshUseCase.execute(command)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
  });

  it('should throw if refresh token is expired in DB', async () => {
    (refreshTokenRepository.findByToken as jest.Mock).mockResolvedValue({
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000),
    });

    const command: RefreshCommand = { token: 'expired-token' };
    await expect(refreshUseCase.execute(command)).rejects.toThrow(
      'Refresh token is invalid or expired',
    );
  });
});
