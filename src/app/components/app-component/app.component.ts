import { Component, OnInit, NgZone } from '@angular/core';
import { GeocodeService } from '../../services/GeocodeService';
import { GetBoundsService } from '../../services/GetBoundsService';
import { HospitalDataService } from '../../services/HospitalDataService';
import { HaversineService } from '../../services/HaversineService';
import { GeolocationService } from '../../services/GeolocationService';
import { Hospital } from '../../objects/Hospital';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor (
    private geocodeService: GeocodeService,
    private getBoundsService: GetBoundsService,
    private hospitalDataService: HospitalDataService,
    private ngZone: NgZone,
    private haversineService: HaversineService,
    private geolocationService: GeolocationService
  ) {}

  lat: number = null;
  lng: number = null;
  initialMarket: any;
  searchLocation: string;
  resultsFor: string;
  Hospitals: Hospital[];
  TotalResults: number;
  filters: string[];
  pinClicked: string;
  clientHeight: string;
  clientWidth: string;
  isMobileBreakpoint: MediaQueryList;

  ngOnInit() {
    const userLat = window['FindAHospitalSettings']['UserLat'];
    const userLng = window['FindAHospitalSettings']['UserLng'];
    this.setInitialMarket(userLat, userLng);
    this.resultsFor = this.initialMarket['Name'];
    this.doSearch(Number(this.initialMarket['Latitude']), Number(this.initialMarket['Longitude']), 0);
    this.geolocationService.getLocation({timeout: 3000, enableHighAccuracy: false, maximumAge: 0})
      .subscribe(geoLocationInfo => {
        console.log(geoLocationInfo);
        if (geoLocationInfo && geoLocationInfo.coords && geoLocationInfo.coords.latitude && geoLocationInfo.coords.longitude) {
          this.onUserGeolocated({
            lat: Number(geoLocationInfo.coords.latitude),
            lng: Number(geoLocationInfo.coords.longitude)
          });
        }
      }, geoLocationErr => {
        console.log(geoLocationErr);
      });

      this.isMobileBreakpoint = window.matchMedia('(max-width: 768px)');

      this.setMapHeightAndWidth();
      window.addEventListener('resize', () => {
        this.setMapHeightAndWidth();
      });
  }

  onMapMarkerClick(markerIndex: number) {
    let hospitalInfoBlocks = document.getElementsByClassName(`hospital-info-block${markerIndex}`);
    if (hospitalInfoBlocks.length) {
      hospitalInfoBlocks[0].scrollIntoView({
        behavior: 'smooth',
        block: 'start' 
      });
    }
  }

  onNotifyPinClicked($event: any) {
    this.pinClicked = $event;
    if (this.isMobileBreakpoint.matches) {
      this.onViewMapClick();
    }
  }

  onViewMapClick() {
    this.clientHeight = `${0}px`;
  }

  onNotifyViewListClicked() {
    this.clientHeight = `${document.documentElement.clientHeight+100}px`;
  }

  onUserGeolocated(coords: any) {
    this.geocodeService.Geocode({ 
      location: coords
    }).subscribe(placeData => {
      if (placeData) {
        let userIsInTargetCountry = false;
        placeData.address_components.forEach(placeDataElement => {
          let isTypeCountry = false;
          placeDataElement.types.forEach(typeElement => {
            if (typeElement === 'country') {
              isTypeCountry = true;
            }
          });
          if (isTypeCountry) {
            if (placeDataElement.long_name === window['FindAHospitalSettings']['Country']) {
              userIsInTargetCountry = true;
            }
          }
        });

        if (userIsInTargetCountry) {
          this.setResultsFor(placeData.address_components);
          console.log('onNotifyUserGeolocated placeData', placeData);
          this.doSearch(placeData.geometry.location.lat(), placeData.geometry.location.lng(), 0);
        } else {
          this.setInitialMarket(coords.lat, coords.lng);
          this.resultsFor = this.initialMarket['Name'];
          this.doSearch(Number(this.initialMarket['Latitude']), Number(this.initialMarket['Longitude']), 0);
        }
      }
    });
  }

  setMapHeightAndWidth() {
    if (this.isMobileBreakpoint.matches) {
      this.clientHeight = `${document.documentElement.clientHeight+100}px`;
      this.clientWidth = `${document.documentElement.clientWidth}px`;
    } else {
      this.clientHeight = '0px';
      this.clientWidth = '100%';
    }
  }

  setInitialMarket(userLat: number, userLng: number){
    //Calculate the closest major market to the user set the initial map location to this market
    const majorMarkets = window['FindAHospitalSettings']['MajorMarkets'];
    this.initialMarket = majorMarkets[0];
    this.initialMarket['distance'] = 9999;
    
    majorMarkets.forEach(majorMarket => {
      const distanceFromMajorMarket = this.haversineService.Calculate(userLat, userLng, majorMarket['Latitude'], majorMarket['Longitude'], 'mile');
      if (distanceFromMajorMarket < this.initialMarket['distance']) {
        this.initialMarket = majorMarket;
        this.initialMarket['distance'] = distanceFromMajorMarket;
      }
    });
  }

  doSearch(lat: number, lng: number, resultCount: number) {
    this.getBoundsService.GetBounds(lat, lng, window['FindAHospitalSettings']['MaximumRadius'])
      .subscribe(getBoundsResult => {
        if (getBoundsResult) {
          this.hospitalDataService.GetHospitalData({
              minLatitude: getBoundsResult.getNorthEast().lat(),
              maxLatitude: getBoundsResult.getSouthWest().lat(),
              minLongitude: getBoundsResult.getNorthEast().lng(),
              maxLongitude: getBoundsResult.getSouthWest().lng(),
              corpCountry: window['FindAHospitalSettings']['CorpCountry'],
              getMoreCount: window['FindAHospitalSettings']['GetMoreCount'],
              resultCount: resultCount,
              currentHospitalType: this.filters,
          }).subscribe(getHospitalDataResponse => {
            this.ngZone.run(() => {
              if (resultCount === 0) {
                this.Hospitals = getHospitalDataResponse.Hospitals;
              } else {
                this.Hospitals = this.Hospitals.concat(getHospitalDataResponse.Hospitals);
              }            
              this.Hospitals.forEach((hospital, idx) => {
                hospital.Index = (idx + 1).toString();
              });
              this.TotalResults = getHospitalDataResponse.TotalResults;
              this.lat = lat;
              this.lng = lng;
            });
          });
        }
      });
  }

  setResultsFor(addressComponents: any) {
    let locality, administrative_area_level_1, country, postal_code; 
    addressComponents.forEach(addressComponent => {
      addressComponent.types.forEach(typeElement => {
        if (typeElement === 'locality') {
          locality = addressComponent.long_name;
        }
        if (typeElement === 'administrative_area_level_1') {
          administrative_area_level_1 = addressComponent.short_name;
        }
        if (typeElement === 'country') {
          country = addressComponent.long_name;
        }
        if (typeElement === 'postal_code') {
          postal_code = addressComponent.long_name;
        }
      });
    });

    let components = [];
    if (locality) components.push(locality);
    if (administrative_area_level_1) components.push(administrative_area_level_1);
    if (postal_code) components.push(postal_code);
    if (country) components.push(country);

    this.resultsFor = components.join(', ');
  }

  onNotifyFilterChange(newFilters: any[]):void {
    this.filters = newFilters;
    this.doSearch(this.lat, this.lng, 0);
  }

  onNotifyLoadMoreClick($event:any):void {
    this.doSearch(this.lat, this.lng, this.Hospitals.length);
  }

  onSearchSubmit() {
    if (this.searchLocation) {
      this.geocodeService.Geocode({ 
        address: this.searchLocation, 
        componentRestrictions: {
          country: window['FindAHospitalSettings']['Country']
        } 
      }).subscribe(placeData => {
          if (placeData) {
            this.setResultsFor(placeData.address_components);
            console.log('onSearchSubmit placeData', placeData);
            this.doSearch(placeData.geometry.location.lat(), placeData.geometry.location.lng(), 0);
          }
        }, err => {
          if (err === 'ZERO_RESULTS') {
            console.log(err);
          }
        });
    }
  }
}
