import {Request, BadRequestError} from "restify";
import {ESSearchQuery, ESSearchResult} from "../repository/elastic-search";
import {settings} from "../config";
import * as moment from "moment";
let bodybuilder = require('bodybuilder');

const MAX_SEARCH_SIZE = 1000;

export function esSearchResultToMarketStats(esResults : ESSearchResult) : MarketStatsResults  {
    let marketStatsResults: MarketStatsResults = {
        total: esResults.total,
        size: esResults.size,
        from: esResults.from
    };
    marketStatsResults.results = esResults.hits.map(esSearchHitToMarketStats);
    return marketStatsResults;
}

export function esSearchHitToMarketStats(searchHit) : MarketStats {
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

export function getRequestToQuery(req: Request) : ESSearchQuery {
    let body = new bodybuilder();
    return <ESSearchQuery> {
        index: settings.ES_STATS_INDEX,
        body: body.query('term', '_id', req.params.id).build('v2')
    };
}

export function searchRequestToQuery(req: Request) : ESSearchQuery {
    let body = new bodybuilder();

    // Item matching
    body = itemRequestToQuery(req, body);
    // Trade hub matching
    body = tradeHubRequestToQuery(req, body);
    // Date range matching
    body = dateRangeRequestToQuery(req, body);

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

export function itemRequestToQuery(req: Request, body)  {
    if(!hasQueryFunction(body)) {
        throw new Error('Missing query function. Expected bodybuilder instance');
    }

    let itemQueried = false;

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
        throw new BadRequestError('You must provide an item to search');
    }

    return body;
}

export function singleItemRequestToQuery(req: Request, body)  {
    if(!hasQueryFunction(body)) {
        throw new Error('Missing query function. Expected bodybuilder instance');
    }

    let itemQueried = false;

    if(req.params.itemId) {
        itemQueried = true;
        body = body.query('term', 'item.id', req.params.itemId);
    }
    if(req.params.itemHref) {
        itemQueried = true;
        body = body.query('term', 'item.href', req.params.itemHref);
    }
    if(!itemQueried) {
        throw new BadRequestError('You must provide an item to search');
    }

    return body;
}

export function singleTradeHubRequestToQuery(req: Request, body) {
    if(!hasQueryFunction(body)) {
        throw new Error('Missing query function. Expected bodybuilder instance');
    }

    let tradeHubQueried = false;

    if(req.params.tradeHubName) {
        tradeHubQueried = true;
        body = body.query('term', 'tradeHub.name', req.params.tradeHubName);
    }
    if(req.params.tradeHubId) {
        tradeHubQueried = true;
        body = body.query('term', 'tradeHub.regionId', req.params.tradeHubId);
    }
    if(!tradeHubQueried) {
        throw new BadRequestError('You must provide a trade hub to search');
    }

    return body;
}

export function tradeHubRequestToQuery(req: Request, body) {
    if(!hasQueryFunction(body)) {
        throw new Error('Missing query function. Expected bodybuilder instance');
    }

    if(req.params.tradeHubName) {
        body = body.query('match', 'tradeHub.name', req.params.tradeHubName);
    }
    if(req.params.tradeHubId) {
        body = body.query('term', 'tradeHub.regionId', req.params.tradeHubId);
    }

    return body;
}

export function dateRangeRequestToQuery(req: Request, body) {
    if(!hasQueryFunction(body)) {
        throw new Error('Missing query function. Expected bodybuilder instance');
    }

    if(req.params.dateRange) {
        if(req.params.dateRange.to && req.params.dateRange.from) {
            if(!moment(req.params.dateRange.to).isValid()) {
                throw new BadRequestError('Invalid date time for dateRange.to. ISO 8601 standard dates required.');
            }
            if(!moment(req.params.dateRange.from).isValid()) {
                throw new BadRequestError('Invalid date time for dateRange.from. ISO 8601 standard dates required.');
            }
            let to = moment(req.params.dateRange.to).unix();
            let from = moment(req.params.dateRange.from).unix();
            body.query('range', 'time', {lte:to, gte:from});
        }
        else if(req.params.dateRange.to) {
            if(!moment(req.params.dateRange.to).isValid()) {
                throw new BadRequestError('Invalid date time for dateRange.to. ISO 8601 standard dates required.');
            }
            let to = moment(req.params.dateRange.to).unix();
            body.query('range', 'time', {lte:to});
        }
        else if(req.params.dateRange.from) {
            if(!moment(req.params.dateRange.from).isValid()) {
                throw new BadRequestError('Invalid date time for dateRange.from. ISO 8601 standard dates required.');
            }
            let from = moment(req.params.dateRange.from).unix();
            body.query('range', 'time', {gte:from});
        }
        else {
            throw new BadRequestError('dateRange must include at least a "to" or "from" date time conforming to ISO 8601 standards.');
        }
    }

    return body;
}

export function hasQueryFunction(obj) : boolean {
    return typeof obj.query === 'function';
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