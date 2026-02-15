import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioReportPage } from './inventario-report-page';

describe('InventarioReportPage', () => {
  let component: InventarioReportPage;
  let fixture: ComponentFixture<InventarioReportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioReportPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
