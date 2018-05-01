import { Component, Input, Output, OnChanges, SimpleChanges, 
  EventEmitter, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Hospital } from '../../objects/Hospital';
import { AgmInfoWindow } from '@agm/core/directives/info-window';

declare var google: any;

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Input() lat: number;
  @Input() lng: number;
  @Input() Hospitals: Hospital;
  @Input() pinClicked: string;
  @Input() clientHeight: string;
  @Input() clientWidth: string;
  @Output() notifyMarkerClicked: EventEmitter<number> = new EventEmitter<number>();
  @Output() notifyViewListClicked: EventEmitter<void> = new EventEmitter<void>();
  @ViewChildren(AgmInfoWindow) agmInfoWindows: QueryList<AgmInfoWindow>;
  bounds: any;
  infoWindows: Array<AgmInfoWindow>;

  clientHeightAnimated() {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) {
      return true;
    }
  }

  onViewListClick(){
    this.notifyViewListClicked.emit();
  }
  
  onMarkerClick(index: number){
    this.notifyMarkerClicked.emit(index);
    this.agmInfoWindows.forEach(agmInfoWindow => {
      if (agmInfoWindow.content['firstElementChild'].id === index.toString()) {
        agmInfoWindow.open();
      } else {
        agmInfoWindow.close();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.Hospitals && changes.Hospitals.currentValue) {
      if (changes.Hospitals.currentValue.length) {
        this.bounds = new google.maps.LatLngBounds();
        changes.Hospitals.currentValue.forEach(element => {
          this.bounds.extend(new google.maps.LatLng(element.Latitude, element.Longitude));
        });
      }
    }
    if (changes.pinClicked && changes.pinClicked.currentValue) {
      this.agmInfoWindows.forEach(agmInfoWindow => {
        if (agmInfoWindow.content['firstElementChild'].id === changes.pinClicked.currentValue) {
          agmInfoWindow.open();
        } else {
          agmInfoWindow.close();
        }
      });
    }
  }

  ngAfterViewInit(){
    this.agmInfoWindows.changes.subscribe(changes => {
      this.agmInfoWindows = changes._results;
    });  
  }

}
