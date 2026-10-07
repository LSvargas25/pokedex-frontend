import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../../testing/test-providers';

import { AscreenPoked } from './ascreen-poked';

describe('AscreenPoked', () => {
  let component: AscreenPoked;
  let fixture: ComponentFixture<AscreenPoked>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AscreenPoked],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(AscreenPoked);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
