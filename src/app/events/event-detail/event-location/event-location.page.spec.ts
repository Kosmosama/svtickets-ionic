import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventLocationPage } from './event-location.page';

describe('EventLocationPage', () => {
  let component: EventLocationPage;
  let fixture: ComponentFixture<EventLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
