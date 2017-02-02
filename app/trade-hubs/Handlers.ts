import {Request, Response, Next} from "restify";
import * as TradeHubService from "./Service";

export function get(req: Request, res: Response, next: Next) {
    res.json(200, {items: TradeHubService.getTradeHubs(), request: req.params});
}
