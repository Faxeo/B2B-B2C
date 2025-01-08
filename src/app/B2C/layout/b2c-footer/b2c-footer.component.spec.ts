import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cFooterComponent } from './b2c-footer.component';

describe('B2cFooterComponent', () => {
  let component: B2cFooterComponent;
  let fixture: ComponentFixture<B2cFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
