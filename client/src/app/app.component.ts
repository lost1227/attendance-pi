import { Component } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected mainForm = new FormGroup({
    message: new FormControl('')
  });

  protected messages = new BehaviorSubject<string[]>([]);

  constructor(
    private websocketService: WebsocketService
  ) {
    websocketService.getMessageObservable().subscribe(message => {
      this.addConsoleLine("=> " + message.type);
    })
  }

  private addConsoleLine(line: string) {
    this.messages.next(this.messages.getValue().concat([line]));
  }

  onSubmit(formData: any, formDirective: FormGroupDirective): void {
    formDirective.resetForm();
    this.websocketService.sendMessage({
      type: formData.message
    });
  }
}
