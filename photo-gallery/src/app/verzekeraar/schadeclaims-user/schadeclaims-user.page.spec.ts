import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchadeclaimsUserPage } from './schadeclaims-user.page';

describe('SchadeclaimsUserPage', () => {
  let component: SchadeclaimsUserPage;
  let fixture: ComponentFixture<SchadeclaimsUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SchadeclaimsUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
