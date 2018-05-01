import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HospitalDataService } from '../../services/HospitalDataService';
import { Hospital } from '../../objects/Hospital';

@Component({
  selector: 'results-list',
  templateUrl: './results.list.component.html',
  styleUrls: ['./results.list.component.scss']
})
export class ResultsListComponent {
  
  @Input() TotalResults: number;
  @Input() Hospitals: Hospital[];
  @Output() notifyLoadMoreClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() notifyPinClicked: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    
  ) {}

  onLoadMoreClick($event: any) {
    $event.preventDefault();
    this.notifyLoadMoreClick.emit();
  }

  onNotifyPinClick($event: any) {
    this.notifyPinClicked.emit($event);
  }

}
