import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../../testing/test-providers';

import { AScreenPokemonSearch } from './ascreen-pokemon-search';

describe('AScreenPokemonSearch', () => {
  let component: AScreenPokemonSearch;
  let fixture: ComponentFixture<AScreenPokemonSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AScreenPokemonSearch],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(AScreenPokemonSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
