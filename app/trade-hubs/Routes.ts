import * as restify from "restify";
import {get} from "./Handlers"

function TradeHubRoutes(api:restify.Server) {
    api.get('/tradehubs', get);
}

export let routes = TradeHubRoutes;
