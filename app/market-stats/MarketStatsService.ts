import {ESSearchResult} from "./MarketStatsDAO";
import {Request} from "restify";
import {ESSearchQuery} from "../services/RepositoryService";
import {settings} from "./../config";
var bodybuilder = require('bodybuilder');

const MAX_SEARCH_SIZE = 1000;

export class MarketStatsService {

    static esSearchResultToMarketStats(esResults : ESSearchResult) : MarketStatsResults  {
        let marketStatsResults: MarketStatsResults = {
            total: esResults.total,
            size: esResults.size,
            from: esResults.from
        };

        marketStatsResults.results = esResults.hits.map(MarketStatsService.esSearchHitToMarketStats);

        return marketStatsResults;
    }

    static esSearchHitToMarketStats(searchHit) : MarketStats {
        let hit;
        try {
            hit = <ESSearchHit>searchHit;
        }
        catch(err) {
            throw new Error('Unable to parse search hit.' + err);
        }

        if(!hit) {
            throw new Error('Unable to parse search hit: null');
        }

        let marketStats : MarketStats = <MarketStats>hit._source;
        marketStats.id = hit._id;
        return marketStats;
    }
    
    static getRequestToQuery(req: Request) : ESSearchQuery {
        let body = new bodybuilder();

        return <ESSearchQuery> {
            index: settings.ES_STATS_INDEX,
            body: body.query('term', '_id', req.params.id).build('v2')
        };
    }

    static searchRequestToQuery(req: Request) : ESSearchQuery {
        let body = new bodybuilder();
        let itemQueried = false;

        // Item matching
        if(req.params.itemId) {
            itemQueried = true;
            body = body.query('term', 'item.id', req.params.itemId);
        }

        if(req.params.itemName) {
            itemQueried = true;
            body = body.query('match', 'item.name', req.params.itemName);
        }

        if(req.params.itemHref) {
            itemQueried = true;
            body = body.query('term', 'item.href', req.params.itemHref);
        }

        if(!itemQueried) {
            throw new Error('You must provide an item to search');
        }

        // Trade hub matching
        if(req.params.tradeHubName) {
            body = body.query('match', 'tradeHub.name', req.params.tradeHubName);
        }

        if(req.params.tradeHubId) {
            body = body.query('term', 'tradeHub.id', req.params.tradeHubId);
        }

        // Paging
        let from = 0;
        if(req.params.from) {
            from = parseInt(req.params.from);
            body = body.from(from);
        }

        let size = 500;
        if(req.params.size) {
            size = parseInt(req.params.size);
            if(size > MAX_SEARCH_SIZE) {
                size = MAX_SEARCH_SIZE;
            }

            body = body.size(size);
        }

        // Sorting
        body = body.sort('time');

        let query: ESSearchQuery = {
            index: settings.ES_STATS_INDEX,
            body: body.build('v2')
        };

        query.from = from;
        query.size = size;

        return query;
    }
}

export interface ESSearchHit {
    _index?: string;
    _type?: string;
    _id: string;
    _score?: number;
    _source: any;
}

export interface MarketStatsResults {
    total: number;
    size: number;
    from: number;
    results?: MarketStats[];
}

export interface MarketStats {
    id?: string;
    time: number;
    buyOrderStats: OrderStats;
    sellOrderStats: OrderStats;
    tradeHub: {
        name: string;
        regionId: string;
    },
    item: {
        id: string;
        href: string;
        name: string;
    }
}

export interface OrderStats {
    avg: number;
    median: number;
    mode: number;
    min: number;
    max: number;
    stdDev: number;
    volume: number;
    orderCount: number;
    avgAge: number;
    medianVolumeEntered: number;
    marketValue: number;
}
