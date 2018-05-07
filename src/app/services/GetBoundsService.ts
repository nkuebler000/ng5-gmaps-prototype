import { Injectable } from '@angular/core';
import { MapsAPILoader } from '@agm/core/services/maps-api-loader/maps-api-loader';
import { Observable } from 'rxjs/Observable';

declare var google: any;

@Injectable()
export class GetBoundsService {
    constructor(private loader: MapsAPILoader) { }

    GetBounds(lat: number, lng: number, radius: number) : Observable<any> {
        return Observable.create(observer => {
            this.loader.load().then(() => {
                try {
                    if (lat && lng) {
                        const circleData = {
                            center: new google.maps.LatLng({ lat: lat, lng: lng }),
                            radius: radius * 1609.34
                        };
                        const boundingData = new google.maps.Circle(circleData).getBounds();
                        observer.next(boundingData);
                    }
                    observer.complete();
                } catch (error) {
                    observer.error('error getting bounds' + error);
                    observer.complete();
                }
            });
            observer.next();
        });
    }
}