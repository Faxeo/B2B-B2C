import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessSidebarComponent } from './business-sidebar.component';

describe('BusinessSidebarComponent', () => {
  let component: BusinessSidebarComponent;
  let fixture: ComponentFixture<BusinessSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
