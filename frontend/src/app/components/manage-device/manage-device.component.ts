import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {DeviceModel, GatewayModel} from "../../common/models/gateway.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GatewayService} from "../../common/services/gateway.service";

@Component({
  selector: 'app-manage-device',
  templateUrl: './manage-device.component.html',
  styleUrls: ['./manage-device.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageDeviceComponent implements OnInit {

  gateway: GatewayModel;
  devicesForm: FormGroup;
  devicesList: DeviceModel[];
  loading: boolean = false;

  constructor(public dialogRef: MatDialogRef<ManageDeviceComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {devices: DeviceModel[] | undefined, gateway: GatewayModel},
              private fb: FormBuilder,
              private gatewayService: GatewayService) {
    this.gateway = this.data.gateway;
    this.devicesList = this.data.devices ?? [];
    this.devicesForm = this.fb.group({
      devices: this.fb.array([])
    });
  }

  get devices() {
    return this.devicesForm.get('devices') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.fillDevices();
  }

  fillDevices(): void {
    this.devicesList.forEach((device, index) => {
      const group = this.fb.group({
        _id: [device._id],
        uid: [device.uid],
        vendor: [device.vendor],
        status: [device.status],
      });
      this.devices.push(group);
    });
  }

  addDevice(): void {
    const group = this.fb.group({
      uid: [''],
      vendor: [''],
      status: ['offline'],
    });
    this.devices.push(group);
  }

  removeDevice(i: number) {
    this.devices.removeAt(i);
  }

  onSlideChange($event: any, index: number) {
    this.devices.at(index).patchValue({status: $event.checked ? 'online' : 'offline'});
  }

  save() {
    if (this.devicesForm.valid) {
      this.loading = !this.loading;
      const formValue = this.devicesForm.value;
      this.gatewayService.updateGatewayDevices(this.gateway, formValue.devices).subscribe((value) => {
        this.loading = false;
        this.closeDialog(true);
      }, (error) => {
        this.loading = false;
        console.log(error);
      });
    }
  }

  closeDialog(reload: boolean = false) {
    this.dialogRef.close(reload);
  }
}
