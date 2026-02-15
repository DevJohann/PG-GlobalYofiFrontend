import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosCrudPage } from './productos-crud-page';

describe('ProductosCrudPage', () => {
  let component: ProductosCrudPage;
  let fixture: ComponentFixture<ProductosCrudPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosCrudPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosCrudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
