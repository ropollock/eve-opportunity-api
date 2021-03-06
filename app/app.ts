import * as restify from "restify";
import {settings} from "./config";
import {routes as marketStatsRoutes} from "./market-stats/Routes";
import {routes as ohlcRoutes} from "./ohlc/Routes";
import {routes as tradeHubRoutes} from "./trade-hubs/Routes";

let api = restify.createServer({
    name: settings.name
});

// Server config
restify.CORS.ALLOW_HEADERS.push('authorization');
api.use(restify.CORS());
api.pre(restify.pre.sanitizePath());
api.use(restify.acceptParser(api.acceptable));
api.use(restify.bodyParser());
api.use(restify.queryParser());
api.use(restify.authorizationParser());
api.use(restify.fullResponse());
api.use(restify.gzipResponse());

// Setup routes
marketStatsRoutes(api);
ohlcRoutes(api);
tradeHubRoutes(api);

// Start server
api.listen(settings.port, () => {
    console.log('INFO: Starting ', settings.name);
    console.log('INFO: listening on ' + settings.port);
});