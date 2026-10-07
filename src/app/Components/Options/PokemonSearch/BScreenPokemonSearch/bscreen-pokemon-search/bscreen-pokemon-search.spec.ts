import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../../testing/test-providers';

import { BScreenPokemonSearch } from './bscreen-pokemon-search';

describe('BScreenPokemonSearch', () => {
  let component: BScreenPokemonSearch;
  let fixture: ComponentFixture<BScreenPokemonSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BScreenPokemonSearch],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(BScreenPokemonSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
