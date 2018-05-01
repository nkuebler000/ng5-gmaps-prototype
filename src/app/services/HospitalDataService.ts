import { Injectable } from '@angular/core';
import { Http, RequestOptions, ResponseContentType, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HospitalDataResponse } from '../objects/HospitalDataResponse';
import { Hospital } from '../objects/Hospital';
import { HospitalType } from '../objects/HospitalType';
import { HoursOfOperationItem } from '../objects/HoursOfOperationItem';
import { Day } from '../objects/Day';

@Injectable()
export class HospitalDataService {
  
  constructor(private http: Http) {}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); 
    return Promise.reject(error.message || error);
  }

  GetHospitalData(fields: {
    minLatitude: number,
    maxLatitude: number,
    minLongitude: number,
    maxLongitude: number,
    corpCountry: string,
    getMoreCount: number,
    resultCount: number,
    currentHospitalType: Array<string>
  }): Observable<HospitalDataResponse> {

    let body = new URLSearchParams();
    body.set('MinLatitude', fields.minLatitude.toString());
    body.set('MaxLatitude', fields.maxLatitude.toString());
    body.set('MinLongitude', fields.minLongitude.toString());
    body.set('MaxLongitude', fields.maxLongitude.toString());
    body.set('CorpCountry', fields.corpCountry);
    body.set('GetMoreCount', fields.getMoreCount.toString());
    body.set('ResultCount', fields.resultCount.toString());
    for (let x = 0; x < fields.currentHospitalType.length; x++){
      body.set(`CurrentHospitalType[${x}]`, fields.currentHospitalType[x]);
    }

    const headers = new Headers();
    headers.set('Accept', 'application/json');
    const options = new RequestOptions({ responseType: ResponseContentType.Json });

    return this.http.post('/api/Search/HospitalSearch/GetHospitals', body, options)
      .map(response => {
        const hospitalDataResponse: HospitalDataResponse = new HospitalDataResponse();
        const json = response.json();
        hospitalDataResponse.TotalResults = json.TotalResults;
        hospitalDataResponse.Hospitals = [];
        if (json.Hospitals && json.Hospitals.forEach) {
          json.Hospitals.forEach((jsonHospital, idx) => {
            const hospital: Hospital  = new Hospital();
            hospital.AddressBlock1 = jsonHospital.AddressBlock1;
            hospital.AddressBlock2 = jsonHospital.AddressBlock2;
            hospital.Latitude = Number(jsonHospital.Latitude);
            hospital.Longitude = Number(jsonHospital.Longitude);
            hospital.Name = jsonHospital.Name;
            hospital.OpenStatusClass = jsonHospital.OpenStatusClass;
            hospital.OpenStatusLabel = jsonHospital.OpenStatusLabel;
            hospital.Phone = jsonHospital.Phone;
            hospital.Timezone = jsonHospital.Timezone;
            hospital.Url = jsonHospital.Url;
            hospital.Zipcode = jsonHospital.Zipcode;

            hospital.Days = [];
            if (jsonHospital.Days && jsonHospital.Days.forEach) {
              jsonHospital.Days.forEach(jsonHospitalDay => {
                const hospitalDay: Day = new Day();
                hospitalDay.CloseTime = jsonHospitalDay.CloseTime;
                hospitalDay.Day = jsonHospitalDay.Day;
                hospitalDay.IsAllDay = jsonHospitalDay.IsAllDay;
                hospitalDay.OpenTime = jsonHospitalDay.OpenTime;
                hospital.Days.push(hospitalDay);
              });
            }

            hospital.HospitalTypes = [];
            if (jsonHospital.HospitalTypes && jsonHospital.HospitalTypes.forEach) {
              jsonHospital.HospitalTypes.forEach(jsonHospitalHospitalType => {
                const hospitalType: HospitalType = new HospitalType();
                hospitalType.ID = jsonHospitalHospitalType.ID;
                hospitalType.DisplayValue = jsonHospitalHospitalType.DisplayValue;
                hospital.HospitalTypes.push(hospitalType);
              });
            }

            hospital.HoursOfOperation = [];
            if (jsonHospital.HoursOfOperation && jsonHospital.HoursOfOperation.forEach) {
              jsonHospital.HoursOfOperation.forEach(jsonHospitalHoursOfOperation => {
                const hoursOfOperationItem: HoursOfOperationItem = new HoursOfOperationItem();
                hoursOfOperationItem.FormattedDayLabel = jsonHospitalHoursOfOperation.FormattedDayLabel;
                hoursOfOperationItem.FormattedOpenAndCloseTime = jsonHospitalHoursOfOperation.FormattedOpenAndCloseTime;
                hospital.HoursOfOperation.push(hoursOfOperationItem);
              });
            }

            hospitalDataResponse.Hospitals.push(hospital);
          });
        }

        
        return hospitalDataResponse;
      }).catch(this.handleError);
  }
}