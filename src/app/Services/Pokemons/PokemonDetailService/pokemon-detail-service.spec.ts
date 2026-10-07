import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { PokemonDetailService } from './pokemon-detail-service';

describe('PokemonDetailService', () => {
  let service: PokemonDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PokemonDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
