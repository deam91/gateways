import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ManageGatewayComponent} from './manage-gateway.component';
import {MaterialModule} from "../../common/shared/material.module";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {GatewayService} from "../../common/services/gateway.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {FormBuilder} from "@angular/forms";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import {GatewayModel} from "../../common/models/gateway.model";
import {expect} from "@angular/flex-layout/_private-utils/testing";
import {of} from "rxjs";

const dialogMock = {
  close: (dialogResult?: any) => {
  }
};

describe('ManageGatewayComponent', () => {
  let component: ManageGatewayComponent;
  let fixture: ComponentFixture<ManageGatewayComponent>;
  let service: GatewayService;

  let data = new GatewayModel('serial', 'name', 'ip', [], '1');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatDialogModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [ManageGatewayComponent],
      providers: [
        MatDialog,
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: MatDialogRef, useValue: dialogMock},
        FormBuilder,
        GatewayService,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageGatewayComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GatewayService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with reload option', () => {
    spyOn(component.dialogRef, 'close');
    spyOn(component, 'closeDialog').and.callThrough();
    component.closeDialog(true);
    expect(component.closeDialog).toHaveBeenCalledWith(true);
    expect(component.dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should not save', fakeAsync(async () =>  {
    spyOn(component, 'save').and.callThrough();
    spyOn(service, 'updateGateway').and.callFake(() => of());
    component.save();

    expect(component.gatewayForm.valid).toBeFalsy();
    expect(component.gatewayForm.get('ip')?.valid).toBeFalsy();
    expect(component.save).toHaveBeenCalled();
  }));

  it('should update', fakeAsync(async () =>  {
    spyOn(component, 'save').and.callThrough();
    spyOn(service, 'updateGateway').and.callFake(() => of());
    component.gatewayForm.get('ip')?.setValue('12.43.12.132');
    fixture.detectChanges();

    component.save();

    let object = new GatewayModel('serial', 'name', '12.43.12.132', []);
    expect(component.gatewayForm.valid).toBeTruthy();
    expect(component.gatewayForm.get('ip')?.valid).toBeTruthy();
    expect(service.updateGateway).toHaveBeenCalledWith(object, '1');
    expect(component.save).toHaveBeenCalled();
  }));

  it('should create a gateway', fakeAsync(async () =>  {
    spyOn(component, 'save').and.callThrough();
    spyOn(service, 'createGateway').and.callFake(() => of());

    component.gateway = undefined;
    component.gatewayForm.get('ip')?.setValue('12.43.12.132');
    component.gatewayForm.get('serial')?.setValue('serial number');
    component.gatewayForm.get('name')?.setValue('gateway name');

    fixture.detectChanges();

    component.save();

    let object = new GatewayModel('serial number', 'gateway name', '12.43.12.132', []);
    expect(component.gatewayForm.valid).toBeTruthy();
    expect(component.gatewayForm.get('ip')?.valid).toBeTruthy();
    expect(service.createGateway).toHaveBeenCalledWith(object);
    expect(component.save).toHaveBeenCalled();
  }));

});
