import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { Ligths } from './ligths';

describe('Ligths', () => {
  let component: Ligths;
  let fixture: ComponentFixture<Ligths>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ligths],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ligths);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
