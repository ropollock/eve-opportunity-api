import * as restify from "restify";
import {settings} from "./config";
import {routes as marketStatsRoutes} from "./market-stats/MarketStatsRoutes";

var api = restify.createServer({
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

// Start server
api.listen(settings.port, () => {
    console.log('INFO: running');
});