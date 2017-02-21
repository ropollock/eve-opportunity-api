const elasticsearch = require('elasticsearch');
import {settings} from "../config";

const esClient = new elasticsearch.Client({
    host: settings.ES_CLUSTER
});

export function search(query: ESSearchQuery) : Promise<any> {
    return esClient.search(query);
}

export function bulk(bulkActions: any[]) : Promise<any> {
    return esClient.bulk(bulkActions);
}

export interface ESSearchQuery {
    index: string;
    body?: any;
    facets?: any;
    q?: string;
    size?: number;
    from?: number;
}

export interface ESSearchResult {
    hits: any[];
    aggregations?: any;
    total: number;
    size: number;
    from: number;
}
