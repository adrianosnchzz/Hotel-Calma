import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarLink } from './generar-link';

describe('GenerarLink', () => {
  let component: GenerarLink;
  let fixture: ComponentFixture<GenerarLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarLink);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
