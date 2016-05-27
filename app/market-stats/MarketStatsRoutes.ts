import * as restify from "restify";
import MarketStatsController from "./MarketStatsController";

function marketstatsRoutes(api:restify.Server) {
    let marketStatsCtrl = new MarketStatsController();

    api.get('/marketstats/:id', marketStatsCtrl.getById);
    api.get('/marketstats', marketStatsCtrl.search);
    api.post('/marketstats/search', marketStatsCtrl.search);
}

export var routes = marketstatsRoutes;
