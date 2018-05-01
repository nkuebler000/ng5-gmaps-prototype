import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Hospital } from '../../objects/Hospital';

@Component({
  selector: 'result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent {
  @Input() hospital: Hospital;
  @Output() notifyPinClick: EventEmitter<string> = new EventEmitter<string>();

  pinClick(){
    this.notifyPinClick.emit(this.hospital.Index);
  }

}
