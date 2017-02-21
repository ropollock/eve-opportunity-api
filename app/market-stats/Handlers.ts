import * as restify from "restify";
import {search as marketStatsSearch} from "./MarketStats";
import * as MarketStatsService from "./Service";
import * as Promise from "bluebird";
let bodybuilder = require('bodybuilder');

export function getById(req: restify.Request, res: restify.Response, next: restify.Next) {
    let query = null;
    try {
        query = MarketStatsService.getRequestToQuery(req);
    }
    catch(error) {
        return next(error);
    }

    if(query === null) {
        return next(new restify.InternalServerError({message: 'Unable to process request: null'}));
    }

    return Promise.try(function() {
        return marketStatsSearch(query);
    }).then(function(response) {
        try {
            if(response.hits.length === 0) {
                return next(new restify.NotFoundError('ID not found.'));
            }

            let marketStats = MarketStatsService.esSearchHitToMarketStats(response.hits[0]);
            res.json(200, {item: marketStats, request: req.params});
        }
        catch(err) {
            return next(new restify.InternalServerError({error: err, request: req.params}));
        }

        return next();
    }).catch(function(error) {
        return next(new restify.InternalServerError({error: error, request: req.params}));
    });
}

export function search(req: restify.Request, res: restify.Response, next: restify.Next) {
    let query = null;
    try {
        query = MarketStatsService.searchRequestToQuery(req);
    }
    catch(error) {
        return next(error);
    }

    if(query === null) {
        return next(new restify.InternalServerError({message: 'Unable to process request: null'}));
    }

    return Promise.try(function() {
        return marketStatsSearch(query);
    }).then(function(response) {
        try {
            let marketStatsResults = MarketStatsService.esSearchResultToMarketStats(response);
            res.json(200, {items: marketStatsResults, request: req.params});
        }
        catch(err) {
            return next(new restify.InternalServerError({error: err, request: req.params}));
        }

        return next();
    }).catch(function(error) {
        return next(new restify.InternalServerError({error: error, request: req.params}));
    });
}
