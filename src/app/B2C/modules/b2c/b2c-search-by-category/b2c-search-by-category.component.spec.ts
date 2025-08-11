import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cSearchByCategoryComponent } from './b2c-search-by-category.component';

describe('B2cSearchByCategoryComponent', () => {
  let component: B2cSearchByCategoryComponent;
  let fixture: ComponentFixture<B2cSearchByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cSearchByCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cSearchByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
