import { HeaderUninassauComponent } from '../components/header-uninassau/header-uninassau.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabPainelPageRoutingModule } from './tab-painel-routing.module';

import { TabPainelPage } from './tab-painel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderUninassauComponent,

    TabPainelPageRoutingModule
  ],
  declarations: [TabPainelPage]
})
export class TabPainelPageModule {}
