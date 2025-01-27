import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'eventDistance',
    standalone: true
})
export class EventDistancePipe implements PipeTransform {
    transform(value: number): string {
        return `${value.toFixed(1)} km`;
    }
}
