import { Day } from './Day';
import { HospitalType } from './HospitalType';
import { HoursOfOperationItem } from './HoursOfOperationItem';

export class Hospital {

  AddressBlock1: string;
  AddressBlock2: string;
  Latitude: number
  Longitude: number;
  Name: string;
  OpenStatusClass: string;
  OpenStatusLabel: string;
  Phone: string;
  Timezone: string;
  Url: string;
  Zipcode: string;
  Days: Array<Day>;
  HospitalTypes: Array<HospitalType>;
  HospitalTypesForDisplay: Array<HospitalType>;
  HoursOfOperation: Array<HoursOfOperationItem>;
  Index: string;
}