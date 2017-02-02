import {RespositoryService, ESSearchQuery, ESSearchResult} from "../services/RepositoryService";

export function search(query: ESSearchQuery) : Promise<ESSearchResult> {
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
    });
}
