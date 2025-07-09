import { DomainModel } from "../../base/domain-model";

export class Etf extends DomainModel {
    ticker: string;
    name: string;
    dailyData: ETFDailyData[];

    constructor(
        id: string,
        ticker: string, 
        name: string, 
        dailyData: ETFDailyData[] = []
    ) {
        super(id);
        this.ticker = ticker;
        this.name = name;
        this.dailyData = dailyData;
    }
}

export class ETFDailyData {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: Date;

    constructor(
        open: number,
        high: number,
        low: number,
        close: number,
        volume: number,
        timestamp: Date
    ) {
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        this.timestamp = timestamp;
    }
}  
