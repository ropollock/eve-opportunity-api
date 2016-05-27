var elasticsearch = require('elasticsearch');
import {settings} from "./../config";

class RepositoryService {
    private client;

    constructor(private ES_CLUSTER: string) {
        this.client = new elasticsearch.Client({
            host: this.ES_CLUSTER
        });
    }

    public bulk(bulkActions: any[]) : Promise<any> {
        return this.client.bulk(bulkActions);
    }

    public search(query: ESSearchQuery) : Promise<any> {
        return this.client.search(query);
    }
}

export let RespositoryService = new RepositoryService(settings.ES_CLUSTER);

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
    total: number;
    size: number;
    from: number;
}