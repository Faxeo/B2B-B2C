import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2CHomeV2Component } from './b2c-homev2.component';

describe('B2cV2HomeComponent', () => {
  let component: B2CHomeV2Component;
  let fixture: ComponentFixture<B2CHomeV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2CHomeV2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2CHomeV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
