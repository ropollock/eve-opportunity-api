import * as restify from "restify";
import {RespositoryService, ESSearchQuery} from "./../services/RepositoryService"
import {settings} from "./../config";
import {MarketStatsDAO} from "./MarketStatsDAO";
import {MarketStatsService} from "./MarketStatsService";
import * as Promise from "bluebird";
var bodybuilder = require('bodybuilder');

export default class MarketStatsController {

    getById(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query = null;
        try {
            query = MarketStatsService.getRequestToQuery(req);
        }
        catch(error) {
            return next(new restify.BadRequestError({message: error.message}));
        }

        if(query === null) {
            return next(new restify.InternalServerError({message: 'Unable to process request: null'}));
        }

        return Promise.try(function() {
            return MarketStatsDAO.search(query);
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

    search(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query = null;
        try {
            query = MarketStatsService.searchRequestToQuery(req);
        }
        catch(error) {
            return next(new restify.BadRequestError({message: error.message}));
        }

        if(query === null) {
            return next(new restify.InternalServerError({message: 'Unable to process request: null'}));
        }

        return Promise.try(function() {
            return MarketStatsDAO.search(query);
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
}
