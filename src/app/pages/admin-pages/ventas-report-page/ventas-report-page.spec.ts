import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasReportPage } from './ventas-report-page';

describe('VentasReportPage', () => {
  let component: VentasReportPage;
  let fixture: ComponentFixture<VentasReportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasReportPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
