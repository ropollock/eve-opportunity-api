import * as restify from "restify";
import MarketStatsController from "./MarketStatsController";

function marketstatsRoutes(api:restify.Server) {
    let marketStatsCtrl = new MarketStatsController();

    api.get('/marketstats/:id', marketStatsCtrl.get);
    api.post('/marketstats/search', marketStatsCtrl.post);
}

export var routes = marketstatsRoutes;
