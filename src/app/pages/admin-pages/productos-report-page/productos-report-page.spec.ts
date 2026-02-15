import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosReportPage } from './productos-report-page';

describe('ProductosReportPage', () => {
  let component: ProductosReportPage;
  let fixture: ComponentFixture<ProductosReportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosReportPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
