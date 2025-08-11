import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cSearchByVehicleComponent } from './b2c-search-by-vehicle.component';

describe('B2cSearchByVehicleComponent', () => {
  let component: B2cSearchByVehicleComponent;
  let fixture: ComponentFixture<B2cSearchByVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cSearchByVehicleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cSearchByVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
