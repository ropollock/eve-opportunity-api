import * as restify from "restify";

export default class MarketStatsController {

    get(req: restify.Request, res: restify.Response, next: restify.Next) {
        res.json(200, {body: 'Success get'});
        return next();
    }

    post(req: restify.Request, res: restify.Response, next: restify.Next) {
        res.json(200, {body: 'Success post'});
        return next();
    }
}
