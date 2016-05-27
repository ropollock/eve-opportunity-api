import {RespositoryService, ESSearchQuery, ESSearchResult} from "./../services/RepositoryService";

export class MarketStatsDAO {
    
    static search(query: ESSearchQuery) : Promise<ESSearchResult> {
        return RespositoryService.search(query).then((response) => {
            return <ESSearchResult> {
                hits: response.hits.hits,
                total: response.hits.total,
                size: query.size,
                from: query.from
            };
        });
    }
}
