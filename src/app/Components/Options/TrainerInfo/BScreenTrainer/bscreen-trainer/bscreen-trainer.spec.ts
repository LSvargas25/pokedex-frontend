import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../../testing/test-providers';

import { BScreenTrainer } from './bscreen-trainer';

describe('BScreenTrainer', () => {
  let component: BScreenTrainer;
  let fixture: ComponentFixture<BScreenTrainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BScreenTrainer],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(BScreenTrainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
