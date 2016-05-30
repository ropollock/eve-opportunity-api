import {Request, Response, Next} from "restify";
import TradeHubService from "./TradeHubsService";

export default class TradeHubsController {
    get(req: Request, res: Response, next: Next) {
        res.json(200, {items: TradeHubService.getTradeHubs(), request: req.params});
    }
}
