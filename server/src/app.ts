import express, { Express, Request, Response  } from 'express';
import { Server } from "http";
import { AppMode, AttendanceEventMessage, AttendanceEventType, MessageType, ServerStateMessage, SwitchModeMessage, WebsocketMessage } from './models/websocket-message.model';
import { ServerState } from "./models/server-state.model";
import { WsManager } from "./ws-manager";
import { FingerprintManager } from './fingerprint-manager';
import { Subscription } from 'rxjs';

interface AppState {
    state: ServerState;

    setUp(app: App): Promise<void>;
    tearDown(app: App): Promise<void>;
}

class InitializingState implements AppState {
    state: ServerState = ServerState.INITIALIZING;

    async setUp(app: App) {}

    async tearDown(app: App) {}

}

class CheckinState implements AppState {
    state = ServerState.CHECK_IN;

    async setUp(app: App) {
        await app.reader.ledOn();

        app.reader.identify().subscribe((result) => {
            app.websockets.broadcastMessage(new AttendanceEventMessage(
                result.id,
                result.success ? AttendanceEventType.CHECK_IN : AttendanceEventType.ERROR_FINGERPRINT,
                result.error
            ));
        });
    }
    async tearDown(app: App) {
        await app.reader.ledOff();
    }

}

class CheckoutState extends CheckinState {

}

export class App {
    private states = {
        [ServerState.INITIALIZING]: new InitializingState(),
        [ServerState.CHECK_IN]: new CheckinState(),
        [ServerState.CHECK_OUT]: new CheckoutState()
    }

    private currState = this.states[ServerState.INITIALIZING];

    public expressHttp: Express;
    public http: Server;
    public websockets: WsManager;
    public reader: FingerprintManager;

    constructor() {
        this.expressHttp = express();

        this.setupHttpRoutes();

        this.http = this.expressHttp.listen(8000);

        console.info("Http server listening at %s", JSON.stringify(this.http.address()));

        this.websockets = new WsManager(this.http);
        this.setupWebsockets();

        console.info("Websocket server is up");

        this.reader = new FingerprintManager();
    }

    public async init() {
        console.info("Initializing fingerprint reader");
        await this.reader.init();
        this.setState(ServerState.CHECK_IN);
    }

    private setupHttpRoutes() {
        this.expressHttp.get('/', (_req: Request, res: Response) => {
            res.send("Express + TypeScript Server 2");
        });
    }

    private setupWebsockets() {
        this.websockets.getClientConnectionStream().subscribe((cc) => {
            cc.sendMessage(new ServerStateMessage(this.currState.state));
        })

        this.websockets.getIncomingMessageObservable().subscribe((message) => {
            switch(message.type) {
                case MessageType.SWITCH_MODE:
                    this.switchMode((message as SwitchModeMessage).mode);
            }
        });
    }

    private switchMode(mode: AppMode) {
        switch(this.currState.state) {
            case ServerState.INITIALIZING:
                break;
            case ServerState.CHECK_IN:
                this.setState(ServerState.CHECK_OUT);
                break;
            case ServerState.CHECK_OUT:
                this.setState(ServerState.CHECK_IN);
                break;
        }
    }

    private async setState(state: ServerState) {
        const newState = this.states[state];
        const oldState = this.currState;
        this.currState = newState;

        console.debug("Switching from state %s to %s", oldState.state, newState.state);

        await oldState.tearDown(this);
        await newState.setUp(this);

        this.websockets.broadcastMessage(new ServerStateMessage(this.currState.state));
    }

}
