import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { PokemonService } from './pokemon-service';

describe('PokemonService', () => {
  let service: PokemonService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PokemonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
