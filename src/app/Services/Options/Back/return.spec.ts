import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { Return } from './return';

describe('Return', () => {
  let service: Return;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(Return);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
