import { Provider } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { PageTitleService } from '@core/services';

export function provideAppTitle(): Provider {
  return {
    provide: TitleStrategy,
    useClass: PageTitleService,
  };
}
