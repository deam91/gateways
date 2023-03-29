import {Component} from '@angular/core';
import {GatewayService} from "./common/services/gateway.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {GatewayModel} from "./common/models/gateway.model";
import {ManageGatewayComponent} from "./components/manage-gateway/manage-gateway.component";
import {ManageDeviceComponent} from "./components/manage-device/manage-device.component";
import {Observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gateways';
  breakpoint: number = 3;
  gateways: GatewayModel[] = [];
  gatewaysObservable$: Observable<GatewayModel[]> | undefined;

  constructor(private gatewayService: GatewayService,
              private matDialog: MatDialog) {
  }

  addGatewayModal(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'gateway-dialog';
    dialogConfig.maxHeight = '80%';
    dialogConfig.maxWidth = '80%';
    dialogConfig.minWidth = '400px';
    dialogConfig.minHeight = '50%';
    dialogConfig.disableClose = true;

    const dialog = this.matDialog.open(ManageGatewayComponent, dialogConfig);
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.gatewaysObservable$ = this.getGateways();
      }
    });
  }

  editGatewayModal(gateway: GatewayModel): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'gateway-dialog';
    dialogConfig.maxHeight = '80%';
    dialogConfig.maxWidth = '80%';
    dialogConfig.minWidth = '400px';

    dialogConfig.minHeight = '50%';
    dialogConfig.disableClose = true;
    dialogConfig.data = gateway;

    const dialog = this.matDialog.open(ManageGatewayComponent, dialogConfig);
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.gatewaysObservable$ = this.getGateways();
      }
    });
  }

  setBreakpoint(): void {
    let width = this.getInnerWidth();
    if (width <= 450) this.breakpoint = 1;
    else if (width <= 700) this.breakpoint = 2;
    else if (width <= 900) this.breakpoint = 3;
    else if (width <= 1200) this.breakpoint = 4;
    else this.breakpoint = 5;
  }

  getInnerWidth(): number {
    return window.innerWidth;
  }

  ngOnInit() {
    this.setBreakpoint();
    this.gatewaysObservable$ = this.getGateways();
  }

  onResize(event: any): void {
    this.setBreakpoint();
  }

  getGateways(): Observable<GatewayModel[]> {
    return this.gatewayService.getGateways();
  }

  openGatewayDevices(gateway: GatewayModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'gateway-devices-dialog';
    dialogConfig.maxHeight = '80%';
    dialogConfig.maxWidth = '80%';
    dialogConfig.minWidth = '400px';

    dialogConfig.minHeight = '50%';
    dialogConfig.disableClose = true;
    dialogConfig.data = {devices: gateway.devices, gateway: gateway};
    const dialog = this.matDialog.open(ManageDeviceComponent, dialogConfig);
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.gatewaysObservable$ = this.getGateways();
      }
    });
  }
}
