import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GatewayModel} from "../../common/models/gateway.model";
import {GatewayService} from "../../common/services/gateway.service";

@Component({
  selector: 'app-manage-gateway',
  templateUrl: './manage-gateway.component.html',
  styleUrls: ['./manage-gateway.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ManageGatewayComponent {

  gatewayForm: FormGroup;
  loading: boolean = false;
  gateway: GatewayModel | undefined;

  constructor(public dialogRef: MatDialogRef<ManageGatewayComponent>,
              @Inject(MAT_DIALOG_DATA) public data: GatewayModel | undefined,
              private fb: FormBuilder,
              private gatewayService: GatewayService) {
    this.gateway = this.data;
    this.gatewayForm = this.fb.group({
      serial: [this.data?.serial ?? ''],
      ip: [this.data?.ip_address ?? '', [
        Validators.required,
        Validators.pattern("(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"),
      ]],
      name: [this.data?.name ?? ''],
    });
  }

  closeDialog(reload: boolean = false) {
    this.dialogRef.close(reload);
  }

  save() {
    if (this.gatewayForm.valid) {
      this.loading = !this.loading;
      const formValue = this.gatewayForm.value;
      const gateway = new GatewayModel(formValue.serial, formValue.name, formValue.ip, []);
      if (this.gateway) {
        this.gatewayService.updateGateway(gateway, this.gateway!._id!).subscribe((value) => {
          this.loading = false;
          this.closeDialog(true);
        }, (error) => {
          this.loading = false;
          console.log(error);
        });
      } else {
        this.gatewayService.createGateway(gateway).subscribe((value) => {
          this.loading = false;
          this.closeDialog(true);
        }, (error) => {
          this.loading = false;
          console.log(error);
        });
      }
    }
  }

}
