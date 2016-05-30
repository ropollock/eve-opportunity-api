
export default class TradeHubService {
    static HUBS = {
        JITA: {
            name: 'jita',
            regionId: 10000002
        },
        AMARR: {
            name: 'amarr',
            regionId: 10000043
        },
        RENS: {
            name: 'rens',
            regionId: 10000030
        },
        DODIXIE: {
            name: 'dodixie',
            regionId: 10000032
        },
        HEK: {
            name: 'hek',
            regionId: 10000042
        }
    };

    static getTradeHubs() :TradeHub[] {
        return Object.keys(TradeHubService.HUBS).map((hub) => { return <TradeHub>TradeHubService.HUBS[hub];});
    }
}

export interface TradeHub {
    name: string;
    regionId: number
}
