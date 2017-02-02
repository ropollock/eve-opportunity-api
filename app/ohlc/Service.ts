import {Request} from "restify";
import {ESSearchQuery} from "../services/RepositoryService";
import * as MarketStatsService from "../market-stats/Service";
import {settings} from "../config";
const bodybuilder = require('bodybuilder');

export enum OHLC_TYPES {
    SELL,
    BUY
}

export function ohlcRequestToQuery(req: Request) : ESSearchQuery {
    let body = new bodybuilder();
    // Require item matching
    body = MarketStatsService.singleItemRequestToQuery(req, body);
    // Require trade hub matching
    body = MarketStatsService.singleTradeHubRequestToQuery(req, body);
    // Date range matching
    body = MarketStatsService.dateRangeRequestToQuery(req, body);

    // Determine if OHLC is for buy or sell orders, default to sell order
    if(req.params.buy) {
        body = buildOHLCAggregation(body, OHLC_TYPES.BUY);
    }
    else {
        req.params.buy = false;
        body = buildOHLCAggregation(body, OHLC_TYPES.SELL);
    }

    body = body.size(0);

    // Sorting
    body = body.sort('time');
    return {
        index: settings.ES_STATS_INDEX,
        body: body.build('v2')
    }
}

export function buildOHLCAggregation(body, type: OHLC_TYPES) {
    if(type === OHLC_TYPES.BUY) {
        return body.aggregation('date_histogram', 'time', {interval: 'day'}, agg => {
            return agg.aggregation('extended_stats', 'buyOrderStats.max')
                .aggregation('avg', 'buyOrderStats.volume')
                .aggregation('date_histogram', 'time', {interval: 'hour'}, subAgg => {
                    return subAgg.aggregation('max', 'buyOrderStats.max');
                });
        });
    }
    else if(type === OHLC_TYPES.SELL) {
        return body.aggregation('date_histogram', 'time', {interval: 'day'}, agg => {
            return agg.aggregation('extended_stats', 'sellOrderStats.min')
                .aggregation('avg', 'sellOrderStats.volume')
                .aggregation('date_histogram', 'time', {interval: 'hour'}, subAgg => {
                    return subAgg.aggregation('min', 'sellOrderStats.min');
                });
        });
    }
    else {
        throw new Error('Unrecognized OHLC type aggregation.');
    }
}

export function OHLCAggregationsToOHLCResults(agg, type: OHLC_TYPES) : OHLCResult[] {
    let dayHistogram = agg.agg_date_histogram_time;
    if(typeof dayHistogram === 'undefined') {
        throw new Error('Invalid aggregation result missing day histogram.');
    }

    return dayHistogram.buckets.map((day) => {return OHLCResultFromDayAggregation(day, type)});
}

export function OHLCResultFromDayAggregation(dayAgg, type: OHLC_TYPES) : OHLCResult {
    if(type === OHLC_TYPES.SELL) {
        let stats = dayAgg["agg_extended_stats_sellOrderStats.min"];
        let time = parseInt(dayAgg.key);
        let avg = stats.avg;
        let min = stats.min;
        let max = stats.max;
        let stdDev = stats.std_deviation;
        let stdDevBounds = {
            lower: stats.std_deviation_bounds.lower,
            upper: stats.std_deviation_bounds.upper
        };
        let avgVolume = dayAgg["agg_avg_sellOrderStats.volume"].value;
        let priceInterval = openAndCloseFromAggregation(
            filterEmptyAggregations(dayAgg.agg_date_histogram_time.buckets), type);

        return <OHLCResult> {
            time: time,
            avg: avg,
            min: min,
            max: max,
            stdDev: stdDev,
            stdDevBounds: stdDevBounds,
            avgVolume: avgVolume,
            open: priceInterval.open,
            close: priceInterval.close
        }
    }
    else if(type === OHLC_TYPES.BUY) {
        let stats = dayAgg["agg_extended_stats_buyOrderStats.max"];
        let time = parseInt(dayAgg.key);
        let avg = stats.avg;
        let min = stats.min;
        let max = stats.max;
        let stdDev = stats.std_deviation;
        let stdDevBounds = {
            lower: stats.std_deviation_bounds.lower,
            upper: stats.std_deviation_bounds.upper
        };
        let avgVolume = dayAgg["agg_avg_buyOrderStats.volume"].value;
        let priceInterval = openAndCloseFromAggregation(
            filterEmptyAggregations(dayAgg.agg_date_histogram_time.buckets), type);

        return <OHLCResult> {
            time: time,
            avg: avg,
            min: min,
            max: max,
            stdDev: stdDev,
            stdDevBounds: stdDevBounds,
            avgVolume: avgVolume,
            open: priceInterval.open,
            close: priceInterval.close
        }
    }
}

export function openAndCloseFromAggregation(hourlyAgg: ESHourlyAggregation[], type: OHLC_TYPES) : PriceInterval {
    if(hourlyAgg.length === 0) {
        throw new Error('Unable to extract open and close prices from empty aggregation results.');
    }

    // Sort
    hourlyAgg.sort((a,b) => {
        return a.key - b.key;
    });

    if(type === OHLC_TYPES.SELL) {
        return <PriceInterval> {
            open: hourlyAgg[0]['agg_min_sellOrderStats.min'].value,
            close: hourlyAgg[hourlyAgg.length-1]['agg_min_sellOrderStats.min'].value
        }
    }
    else if(type === OHLC_TYPES.BUY) {
        return <PriceInterval> {
            open: hourlyAgg[0]['agg_max_buyOrderStats.max'].value,
            close: hourlyAgg[hourlyAgg.length-1]['agg_max_buyOrderStats.max'].value
        }
    }
}

export function filterEmptyAggregations(agg: any[]) {
    return agg.filter(interval => {
        return interval.doc_count > 0;
    });
}

export interface OHLCResult {
    time: number;
    avg: number;
    min: number;
    max: number;
    open: number;
    close: number;
    avgVolume: number;
    stdDev: number;
    stdDevBounds: {
        lower: number;
        upper: number;
    }
}

interface PriceInterval {
    open: number;
    close: number;
}

interface ESHourlyAggregation {
    "agg_min_sellOrderStats.min"?: {
        value: number;
    };
    "agg_max_buyOrderStats.max"?: {
        value: number;
    };
    key: number;
}
