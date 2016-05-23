export interface Config {
    name: string;
    port: number;
    env: string;
    version: string;
}

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env = process.env.NODE_ENV || 'development';

export var settings: Config = {
    name: 'Eve Opportunity API',
    version: '0.0.1',
    port: 3000,
    env: 'dev'
};


if(env !== 'development') {
    settings.env = 'prod';
}