import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesReportPage } from './clientes-report-page';

describe('ClientesReportPage', () => {
  let component: ClientesReportPage;
  let fixture: ComponentFixture<ClientesReportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesReportPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
