import * as restify from "restify";
import TradeHubsController from "./TradeHubsController"

function TradeHubRoutes(api:restify.Server) {
    let tradeHubsCtrl = new TradeHubsController();
    api.get('/tradehubs', tradeHubsCtrl.get);
}

export var routes = TradeHubRoutes;