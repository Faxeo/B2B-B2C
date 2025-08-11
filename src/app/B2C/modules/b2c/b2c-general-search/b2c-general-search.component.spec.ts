import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cGeneralSearchComponent } from './b2c-general-search.component';

describe('B2cGeneralSearchComponent', () => {
  let component: B2cGeneralSearchComponent;
  let fixture: ComponentFixture<B2cGeneralSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cGeneralSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cGeneralSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
