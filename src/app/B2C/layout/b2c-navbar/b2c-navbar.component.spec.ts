import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cNavbarComponent } from './b2c-navbar.component';

describe('B2cNavbarComponent', () => {
  let component: B2cNavbarComponent;
  let fixture: ComponentFixture<B2cNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cNavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
