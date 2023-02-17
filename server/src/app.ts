import express, { Express, Request, Response  } from 'express';
import { Server } from "http";
import { AppMode, MessageType, ServerStateMessage, SwitchModeMessage, WebsocketMessage } from './models/websocket-message.model';
import { ServerState } from "./models/server-state.model";
import { WsManager } from "./ws-manager";

export class App {
    private state: ServerState = ServerState.INITIALIZING;

    private expressHttp: Express;
    private http: Server;
    private websockets: WsManager;

    constructor() {
        this.expressHttp = express();

        this.setupHttpRoutes();

        this.http = this.expressHttp.listen(8000);

        this.websockets = new WsManager(this.http);
        this.setupWebsockets();

        this.updateServerState(ServerState.CHECK_IN);
    }

    private setupHttpRoutes() {
        this.expressHttp.get('/', (_req: Request, res: Response) => {
            res.send("Express + TypeScript Server 2");
        });
    }

    private setupWebsockets() {
        this.websockets.getClientConnectionStream().subscribe((cc) => {
            cc.sendMessage(new ServerStateMessage(this.state));
        })

        this.websockets.getIncomingMessageObservable().subscribe((message) => {
            switch(message.type) {
                case MessageType.SWITCH_MODE:
                    this.switchMode((message as SwitchModeMessage).mode);
            }
        });
    }

    private updateServerState(state: ServerState) {
        this.state = state;
        this.websockets.broadcastMessage(new ServerStateMessage(state));
    }

    private switchMode(mode: AppMode) {
        switch(this.state) {
            case ServerState.INITIALIZING:
                break;
        }
    }

}
