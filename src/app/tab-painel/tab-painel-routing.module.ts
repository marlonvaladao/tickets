import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabPainelPage } from './tab-painel.page';

const routes: Routes = [
  {
    path: '',
    component: TabPainelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabPainelPageRoutingModule {}
