import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { PokedService } from './poked-screen-state';

describe('PokedService', () => {
  let service: PokedService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PokedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
