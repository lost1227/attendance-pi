import { Server } from 'http';
import { WebsocketMessage } from './models/websocket-message.model';
import { map, Observable, Observer, ReplaySubject, Subject, Subscriber } from 'rxjs';
import { WebSocketServer, WebSocket, MessageEvent } from 'ws';

export class ClientConnection {
    private messageSubject = new Subject<WebsocketMessage>();

    constructor(
        private socket: WebSocket,
        outgoingMessageStream: Observable<WebsocketMessage>
    ) {
        new Observable((obs: Observer<MessageEvent>) => {
            socket.onmessage = obs.next.bind(obs);
            socket.onerror = obs.error.bind(obs);
            socket.onclose = obs.complete.bind(obs);

            return socket.close.bind(socket);
        }).pipe(
            map((event: MessageEvent) => JSON.parse(event.data.toString()) as WebsocketMessage)
        ).subscribe(this.messageSubject);

        let subscription = outgoingMessageStream.subscribe(this.sendMessage.bind(this));
        this.messageSubject.subscribe({
            complete: () => {subscription.unsubscribe()}
        });
    }

    public getMessageObservable(): Observable<WebsocketMessage> {
        return this.messageSubject;
    }

    public sendMessage(message: WebsocketMessage) {
        this.socket.send(JSON.stringify(message));
    }
}

export class WsManager {
    private readonly websocketPath = "/api/ws";

    private socketServer: WebSocketServer;
    private incomingMessages = new Subject<WebsocketMessage>();
    private outgoingMessages = new Subject<WebsocketMessage>();
    private newClientStream = new ReplaySubject<ClientConnection>(Infinity, 1000);

    private subscribers: ClientConnection[] = []

    constructor(httpServer: Server) {
        this.socketServer = new WebSocketServer({
            server: httpServer,
            path: "/api/ws"
        });

        this.socketServer.on('connection', this.newClient.bind(this))
    }

    private newClient(ws: WebSocket) {
        let client = new ClientConnection(ws, this.outgoingMessages);
        this.subscribers.push(client);
        client.getMessageObservable().subscribe({
            next: (message) => this.incomingMessages.next(message),
            complete: () => {
                this.subscribers = this.subscribers.filter(it => it != client);
            }
        });
        this.newClientStream.next(client);
    }

    public getClientConnectionStream(): Observable<ClientConnection> {
        return this.newClientStream;
    }

    public getIncomingMessageObservable(): Observable<WebsocketMessage> {
        return this.incomingMessages;
    }

    public broadcastMessage(message: WebsocketMessage) {
        this.outgoingMessages.next(message);
    }

}
