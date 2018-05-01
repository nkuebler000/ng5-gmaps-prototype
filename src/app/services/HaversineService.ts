import { Injectable } from '@angular/core';

@Injectable()
export class HaversineService {

    private toRad(num: number) {
        return num * Math.PI / 180;
    }

    Calculate(startLat: number, startLng: number, endLat: number, endLng: number, unit: string): number {
        const radii = {
            km: 6371,
            mile: 3960,
            meter: 6371000
        }

        let R = radii.km;
        if (unit) {
            R = radii[unit];
        }

        let dLat = this.toRad(endLat - startLat);
        let dLon = this.toRad(endLng - startLng);
        let lat1 = this.toRad(startLat);
        let lat2 = this.toRad(endLat);

        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c;
    }

}