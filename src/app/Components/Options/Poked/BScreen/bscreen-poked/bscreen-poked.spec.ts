import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../../testing/test-providers';

import { BScreenPoked } from './bscreen-poked';

describe('BScreenPoked', () => {
  let component: BScreenPoked;
  let fixture: ComponentFixture<BScreenPoked>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BScreenPoked],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(BScreenPoked);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
