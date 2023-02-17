import { Injectable } from '@angular/core';
import { map, Observable, Observer, ReplaySubject } from 'rxjs';
import { WebsocketMessage } from 'src/app/models/websocket-message.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;
  private messageSubject = new ReplaySubject<WebsocketMessage>(Infinity, 30000);

  constructor() {
    this.socket = new WebSocket(this.getWsUrl());

    let socket = this.socket;

    new Observable((obs: Observer<MessageEvent>) => {
      socket.onmessage = obs.next.bind(obs);
      socket.onerror = obs.error.bind(obs);
      socket.onclose = obs.complete.bind(obs);

      // If the messageSubject should ever unsubscribe from this source observable,
      // the following TeardownLogic will close the WebSocket
      return socket.close.bind(socket);
    }).pipe(
      map((event: MessageEvent) => JSON.parse(event.data) as WebsocketMessage)
    ).subscribe(this.messageSubject);
  }

  private getWsUrl(): string {
    const location = window.location;
    let protocol;
    if(location.protocol === "https:") {
      protocol = "wss:";
    } else {
      protocol = "ws:";
    }

    return protocol + "//" + location.hostname + ":" + location.port + "/api/ws"
  }

  public getMessageObservable(): Observable<WebsocketMessage> {
    return this.messageSubject;
  }

  public sendMessage(message: WebsocketMessage) {
    this.socket.send(JSON.stringify(message));
  }

}
