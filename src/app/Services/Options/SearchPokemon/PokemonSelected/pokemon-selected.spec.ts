import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-providers';

import  {PokemonSelected} from './pokemon-selected';

describe('PokemonSelected', () => {
  let service: PokemonSelected;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PokemonSelected);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
