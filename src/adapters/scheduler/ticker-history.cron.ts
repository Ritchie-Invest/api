import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UpdateTickersHistoryUseCase } from '../../core/usecases/update-tickers-history-use.case';

@Injectable()
export class TickerHistoryCronService implements OnModuleInit {
  private readonly logger = new Logger(TickerHistoryCronService.name);

  constructor(
    private readonly updateTickersHistoryUseCase: UpdateTickersHistoryUseCase,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const expr =
      process.env.CRON_UPDATE_TICKERS_HISTORY ||
      CronExpression.EVERY_DAY_AT_5AM;

    const job = new CronJob(expr, async () => {
      const startedAt = new Date();
      this.logger.log(`Start tickers history update (cron=${expr})`);
      try {
        await this.updateTickersHistoryUseCase.execute();
        const duration = Date.now() - startedAt.getTime();
        this.logger.log(
          `End of tickers history update - duration: ${duration}ms`,
        );
      } catch (error) {
        this.logger.error('Error during tickers history update', error);
      }
    });

    this.schedulerRegistry.addCronJob('updateTickersHistory', job);
    job.start();
    this.logger.log(`Cron 'updateTickersHistory' started with expr='${expr}'`);
  }
}
