import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { AScreen } from './ascreen';

describe('AScreen', () => {
  let component: AScreen;
  let fixture: ComponentFixture<AScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AScreen],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(AScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
