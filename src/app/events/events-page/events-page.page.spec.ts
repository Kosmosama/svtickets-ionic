import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsPagePage } from './events-page.page';

describe('EventsPagePage', () => {
  let component: EventsPagePage;
  let fixture: ComponentFixture<EventsPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
