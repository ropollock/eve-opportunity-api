import * as restify from "restify";
import {createOHLC} from "./Handlers";

function OHLCRoutes(api:restify.Server) {
    api.post('/ohlc', createOHLC);
}

export let routes = OHLCRoutes;
