import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import {ManageDeviceComponent} from './manage-device.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {MaterialModule} from "../../common/shared/material.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {FormArray, FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {DeviceModel, GatewayModel} from "../../common/models/gateway.model";
import {expect} from "@angular/flex-layout/_private-utils/testing";
import {GatewayService} from "../../common/services/gateway.service";
import {of} from "rxjs";

const dialogMock = {
  close: (dialogResult?: any) => {
  }
};

describe('ManageDeviceComponent', () => {
  let component: ManageDeviceComponent;
  let fixture: ComponentFixture<ManageDeviceComponent>;
  let service: GatewayService;

  let dialogData = {
    devices: [new DeviceModel('uid', 'vendor', 'online'),],
    gateway: new GatewayModel('serial', 'name', 'ip', []),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatDialogModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [ManageDeviceComponent],
      providers: [
        MatDialog,
        {provide: MAT_DIALOG_DATA, useValue: dialogData},
        {
          provide: MatDialogRef, useValue: dialogMock
        },
        FormBuilder,
        GatewayService,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageDeviceComponent);
    // loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    service = TestBed.inject(GatewayService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill devices form array', async () => {
    // let dialogs = await loader.getAllHarnesses(MatDialogHarness);
    spyOn(component, 'fillDevices').and.callThrough();
    component.fillDevices();
    fixture.detectChanges();

    expect(component.fillDevices).toHaveBeenCalled();
    expect(component.devices.length).toEqual(2);
  });

  it('should get devices form array', async () => {
    // let dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(component.devices).toBeInstanceOf(FormArray);
    expect(component.devices.length).toEqual(dialogData.devices.length);
  });

  it('should add a new device', async () => {
    spyOn(component, 'addDevice').and.callThrough();
    component.addDevice();
    fixture.detectChanges();

    expect(component.addDevice).toHaveBeenCalled();
    expect(component.devices.length).toEqual(2);
  });

  it('should remove a device', () => {
    fixture.autoDetectChanges(true);
    spyOn(component, 'removeDevice').and.callThrough();
    component.removeDevice(0);

    expect(component.removeDevice).toHaveBeenCalled();
    expect(component.devicesForm.get('devices')?.value.length).toEqual(0);
  });

  it('should switch status online/offline', fakeAsync(async () => {
    fixture.autoDetectChanges(true);
    spyOn(component, 'onSlideChange').and.callThrough();

    component.onSlideChange({checked: false}, 0);
    expect(component.onSlideChange).toHaveBeenCalledWith({checked: false}, 0);
    expect(component.devices.at(0).get('status')?.value).toEqual('offline');

    component.onSlideChange({checked: true}, 0);
    expect(component.onSlideChange).toHaveBeenCalledWith({checked: true}, 0);
    expect(component.devices.at(0).get('status')?.value).toEqual('online');
  }));

  it('should close the dialog with reload option', () => {
    spyOn(component.dialogRef, 'close');
    spyOn(component, 'closeDialog').and.callThrough();
    component.closeDialog(true);
    expect(component.closeDialog).toHaveBeenCalledWith(true);
    expect(component.dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should save the devices', () => {
    spyOn(component, 'save').and.callThrough();
    spyOn(service, 'updateGatewayDevices').and.callFake(() => of());
    component.save();
    expect(service.updateGatewayDevices).toHaveBeenCalledWith(dialogData.gateway, component.devicesForm.value.devices);
    expect(component.save).toHaveBeenCalled();
  });

});
