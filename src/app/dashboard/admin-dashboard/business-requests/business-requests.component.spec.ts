import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRequestsComponent } from './business-requests.component';

describe('BusinessRequestsComponent', () => {
  let component: BusinessRequestsComponent;
  let fixture: ComponentFixture<BusinessRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
