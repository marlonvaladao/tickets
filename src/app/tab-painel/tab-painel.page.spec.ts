import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabPainelPage } from './tab-painel.page';

describe('TabPainelPage', () => {
  let component: TabPainelPage;
  let fixture: ComponentFixture<TabPainelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabPainelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
