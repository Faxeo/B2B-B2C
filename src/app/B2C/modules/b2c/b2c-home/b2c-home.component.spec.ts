import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cHomeComponent } from './b2c-home.component';

describe('B2cHomeComponent', () => {
  let component: B2cHomeComponent;
  let fixture: ComponentFixture<B2cHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
