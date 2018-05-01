import { environment } from '../environments/environment';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

//components
import { AppComponent } from './components/app-component/app.component';
import { MapComponent } from './components/map-component/map.component';
import { FilterComponent } from './components/filter-component/filter.component';
import { ResultsListComponent} from './components/results-list-component/results.list.component';
import { ResultComponent } from './components/result-component/result.component';

//services
import { HospitalDataService } from './services/HospitalDataService';
import { GeocodeService } from './services/GeocodeService';
import { GetBoundsService } from './services/GetBoundsService';
import { HaversineService } from './services/HaversineService';
import { GeolocationService } from './services/GeolocationService';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    FilterComponent,
    ResultsListComponent,
    ResultComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: window['FindAHospitalSettings']['GMapsAPIKey']
    })
  ],
  providers: [
    HospitalDataService,
    GeocodeService,
    GetBoundsService,
    HaversineService,
    GeolocationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }