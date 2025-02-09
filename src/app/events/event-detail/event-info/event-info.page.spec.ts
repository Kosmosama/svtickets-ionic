import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventInfoPage } from './event-info.page';

describe('EventInfoPage', () => {
  let component: EventInfoPage;
  let fixture: ComponentFixture<EventInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
