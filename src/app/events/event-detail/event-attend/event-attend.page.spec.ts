import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventAttendPage } from './event-attend.page';

describe('EventAttendPage', () => {
  let component: EventAttendPage;
  let fixture: ComponentFixture<EventAttendPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAttendPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
