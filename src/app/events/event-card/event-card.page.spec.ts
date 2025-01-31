import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCardPage } from './event-card.page';

describe('EventCardPage', () => {
  let component: EventCardPage;
  let fixture: ComponentFixture<EventCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
