import * as restify from "restify";
import {getById, search} from "./Handlers";

function marketstatsRoutes(api:restify.Server) {
    api.get('/marketstats/:id', getById);
    api.get('/marketstats', search);
    api.post('/marketstats/search', search);
}

export let routes = marketstatsRoutes;
