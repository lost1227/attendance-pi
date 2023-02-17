import express, { Express, Request, Response } from 'express';
import { WebSocketServer, WebSocket, RawData } from 'ws';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
    res.send("Express + TypeScript Server 2");
})

const httpServer = app.listen(8000);
const wss = new WebSocketServer({
    server: httpServer,
    path: "/api/ws"
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('error', console.error);

    ws.on('message', (data: RawData) => {
        console.log('received: %s', data);

        ws.send(data.toString());
    })

    ws.send(JSON.stringify({
        type: "setup"
    }));
})
