import * as restify from "restify";
import OHLCController from "./OHLCController";

function OHLCRoutes(api:restify.Server) {
    let ohlcCtrl = new OHLCController();
    api.post('/ohlc', ohlcCtrl.createOHLC);
}

export var routes = OHLCRoutes;