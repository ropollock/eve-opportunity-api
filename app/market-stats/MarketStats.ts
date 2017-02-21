import {search as esSearch, ESSearchQuery, ESSearchResult} from "../repository/elastic-search";

export function search(query: ESSearchQuery) : Promise<ESSearchResult> {
    return esSearch(query).then((response) => {
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
