import {Request, Response, Next, InternalServerError} from "restify";
import {MarketStatsDAO} from "./../market-stats/MarketStatsDAO";
import {OHLCService, OHLC_TYPES} from "./OHLCService";
import * as Promise from "bluebird";

export default class OHLCController {
    createOHLC(req: Request, res: Response, next: Next) {
        let query = null;
        try {
            query = OHLCService.ohlcRequestToQuery(req);
        }
        catch(error) {
            return next(error);
        }

        if(query === null) {
            return next(new InternalServerError({message: 'Unable to process request: null'}));
        }

        return Promise.try(function() {
            return MarketStatsDAO.search(query);
        }).then(function(response) {
            try {
                let ohlcResults = OHLCService.OHLCAggregationsToOHLCResults(response.aggregations, req.params.buy ? OHLC_TYPES.BUY : OHLC_TYPES.SELL);
                res.json(200, {days: ohlcResults, totalDays: ohlcResults.length, request: req.params});
            }
            catch(err) {
                return next(new InternalServerError({error: err, request: req.params}));
            }

            return next();
        }).catch(function(error) {
            return next(new InternalServerError({error: error, request: req.params}));
        });
    }
}
