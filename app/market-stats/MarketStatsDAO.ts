import {RespositoryService, ESSearchQuery, ESSearchResult} from "./../services/RepositoryService";

// @TODO refactor this to functional style
export class MarketStatsDAO {
    static search(query: ESSearchQuery) : Promise<ESSearchResult> {
        return RespositoryService.search(query).then((response) => {
            // @TODO log search
            let result = <ESSearchResult> {
                hits: response.hits.hits,
                total: response.hits.total,
                size: query.size,
                from: query.from
            };

            if(response.aggregations) {
                result.aggregations = response.aggregations;
            }

            return result;
        }).catch(function(error) {
            // @TODO log error
            return error;
        });
    }
}
