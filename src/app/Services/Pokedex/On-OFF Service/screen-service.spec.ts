import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { ScreenService } from './screen-service';

describe('ScreenService', () => {
  let service: ScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(ScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
