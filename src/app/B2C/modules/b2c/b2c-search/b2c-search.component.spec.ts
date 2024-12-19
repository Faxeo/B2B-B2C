import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cSearchComponent } from './b2c-search.component';

describe('B2cSearchComponent', () => {
  let component: B2cSearchComponent;
  let fixture: ComponentFixture<B2cSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
