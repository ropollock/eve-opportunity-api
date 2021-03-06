import {Request, Response, Next, InternalServerError} from "restify";
import {search} from "../market-stats/MarketStats";
import {ohlcRequestToQuery, OHLCAggregationsToOHLCResults, OHLC_TYPES} from "./Service";
import * as Promise from "bluebird";

export function createOHLC(req: Request, res: Response, next: Next) {
    let query = null;
    try {
        query = ohlcRequestToQuery(req);
    }
    catch(error) {
        return next(error);
    }

    if(query === null) {
        return next(new InternalServerError({message: 'Unable to process request: null'}));
    }

    return Promise.try(function() {
        return search(query);
    }).then(function(response) {
        try {
            let ohlcResults = OHLCAggregationsToOHLCResults(response.aggregations,
                req.params.buy ? OHLC_TYPES.BUY : OHLC_TYPES.SELL);
            res.json(200, {days: ohlcResults, totalDays: ohlcResults.length, request: req.params});
        }
        catch(err) {
            return next(new InternalServerError({error: err, request: req.params}));
        }

        return next();
    });
}
