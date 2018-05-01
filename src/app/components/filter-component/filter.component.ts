import { Component, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  filterItems: any[] = [];
  selectedFilters: any[] = [];
  @Output() notifyFilterChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(){
    this.filterItems = window['FindAHospitalSettings']['HospitalTypes'];
    if (this.filterItems.length > 0) {
      this.filterItems.forEach(filterItem => {
        if (filterItem.id === window['FindAHospitalSettings']['AllHospitalsType']) {
          this.selectedFilters.push(filterItem.id);  
        }
      });
    }
  }

  filterItemClick($event: any, id:string){
    $event.preventDefault();

    //remove the all hospitals filter when selecting on of the others
    const allHospitalsId = window['FindAHospitalSettings']['AllHospitalsType'];
    if (id !== allHospitalsId) {
      const allHospitalsIndex = this.selectedFilters.indexOf(allHospitalsId);
      if (allHospitalsIndex != -1) {
        this.selectedFilters.splice(allHospitalsIndex, 1);
      }  
    }

    //when selecting the all hospitals filter deselect all the other filters
    if (id === allHospitalsId) {
      this.selectedFilters = [allHospitalsId];
    }

    const index = this.selectedFilters.indexOf(id);
    if (index === -1) {
      this.selectedFilters.push(id);
    } else {
      if (this.selectedFilters.length !== 1) {
        this.selectedFilters.splice(index, 1);
      }
    }
    this.notifyFilterChange.emit(this.selectedFilters);
    
  }

  ngOnInit() {
    this.notifyFilterChange.emit(this.selectedFilters);
  }

}
