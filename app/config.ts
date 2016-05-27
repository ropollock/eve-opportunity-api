export interface Config {
    name: string;
    port: number;
    env: string;
    version: string;
    ES_CLUSTER: string;
    ES_STATS_INDEX: string;
}

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var env = process.env.APP_CONTEXT || 'dev';
var port = process.env.APP_PORT || 3000;
const esCluster = process.env.ES_CLUSTER || 'localhost:9200';
const esStatsIndex = process.env.ES_STATS_INDEX || 'marketstats';

export var settings: Config = {
    name: 'Eve Opportunity API',
    version: '0.0.1',
    port: port,
    env: env,
    ES_CLUSTER: esCluster,
    ES_STATS_INDEX: esStatsIndex
};

if(env !== 'dev') {
    settings.env = 'prod';
}