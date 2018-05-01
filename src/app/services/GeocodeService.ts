import { Injectable } from '@angular/core';
import { MapsAPILoader } from '@agm/core/services/maps-api-loader/maps-api-loader';
import { Observable } from 'rxjs/Observable';

declare var google: any;

@Injectable()
export class GeocodeService {
  constructor(private loader: MapsAPILoader) { }

  Geocode(geocodeParams: any): Observable<any> {
    return Observable.create(observer => {
      try {
          this.loader.load().then(() => {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode(geocodeParams, (results, status) => {

                  if (status === google.maps.GeocoderStatus.OK) {
                      const place = results[0];
                      observer.next(place);
                      observer.complete();
                  } else {
                      if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                          observer.error('ZERO_RESULTS');
                      }else {
                          observer.error(status);
                      }
                      
                      observer.complete();
                  }
              });
          });
      } catch (error) {
          observer.error('error getGeocoding' + error);
          observer.complete();
      }
      observer.next();
  });
  }

}