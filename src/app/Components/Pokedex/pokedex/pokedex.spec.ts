import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { Pokedex } from './pokedex';

describe('Pokedex', () => {
  let component: Pokedex;
  let fixture: ComponentFixture<Pokedex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pokedex],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pokedex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
