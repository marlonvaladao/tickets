import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { addIcons } from 'ionicons';



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
