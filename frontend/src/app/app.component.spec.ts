import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {GatewayService} from "./common/services/gateway.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatDialog, MatDialogConfig, MatDialogModule} from "@angular/material/dialog";
import {MaterialModule} from "./common/shared/material.module";
import {expect} from "@angular/flex-layout/_private-utils/testing";
import {of} from "rxjs";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import {ManageGatewayComponent} from "./components/manage-gateway/manage-gateway.component";
import {GatewayModel} from "./common/models/gateway.model";
import {ManageDeviceComponent} from "./components/manage-device/manage-device.component";

describe('AppComponent', () => {
  let app: AppComponent;
  let service: GatewayService;
  let modalServiceSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpyObj = jasmine.createSpyObj(
    {
      afterClosed: of({}),
      close: null,
      componentInstance: {
        onAdd: (data: any) => of({data})
      }
    }
  );

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('modalService', ['open']);
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MaterialModule,
        MatDialogModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        GatewayService,
        {provide: MatDialog, useValue: modalServiceSpy}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    modalServiceSpy.open.and.returnValue(dialogRefSpyObj);

    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    service = TestBed.inject(GatewayService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
    expect(app.title).toEqual('gateways');
    expect(app.gateways).toEqual([]);
  });

  it('should set the breakpoint', () => {
    let spy = spyOn(app, 'getInnerWidth').and.returnValue(400);
    spyOn(app, 'setBreakpoint').and.callThrough();

    app.setBreakpoint();
    expect(app.breakpoint).toEqual(1);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();

    spy.and.returnValue(600);
    app.setBreakpoint();
    expect(app.breakpoint).toEqual(2);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();

    spy.and.returnValue(800);
    app.setBreakpoint();
    expect(app.breakpoint).toEqual(3);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();

    spy.and.returnValue(1000);
    app.setBreakpoint();
    expect(app.breakpoint).toEqual(4);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();

    spy.and.returnValue(1300);
    app.setBreakpoint();
    expect(app.breakpoint).toEqual(5);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();
  });

  it('should change breakpoint on resize', () => {
    let spy = spyOn(app, 'getInnerWidth').and.returnValue(400);
    spyOn(app, 'setBreakpoint').and.callThrough();

    app.onResize({});
    expect(app.breakpoint).toEqual(1);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();

    spy.and.returnValue(600);
    app.onResize({});
    expect(app.breakpoint).toEqual(2);
    expect(app.getInnerWidth).toHaveBeenCalled();
    expect(app.setBreakpoint).toHaveBeenCalled();
  });

  it(`should get gateways`, fakeAsync(() => {
    spyOn(app, 'getGateways').and.callThrough();
    spyOn(service, 'getGateways').and.callFake(() => of([]));

    app.getGateways();
    tick(1000);
    expect(app.getGateways).toHaveBeenCalled();
    expect(service.getGateways).toHaveBeenCalled();
  }));

  it('should open add gateway modal', () => {
    const fakeDialogConfig = new MatDialogConfig;
    fakeDialogConfig.panelClass = 'gateway-dialog';
    fakeDialogConfig.maxHeight = '80%';
    fakeDialogConfig.maxWidth = '80%';
    fakeDialogConfig.minWidth = '400px';
    fakeDialogConfig.minHeight = '50%';
    fakeDialogConfig.disableClose = true;
    app.addGatewayModal();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(ManageGatewayComponent, fakeDialogConfig);
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
  })

  it('should open edit gateway modal', () => {
    let gateway = new GatewayModel('serial', 'name', '12.32.12.43', []);
    const fakeDialogConfig = new MatDialogConfig;
    fakeDialogConfig.panelClass = 'gateway-dialog';
    fakeDialogConfig.maxHeight = '80%';
    fakeDialogConfig.maxWidth = '80%';
    fakeDialogConfig.minWidth = '400px';
    fakeDialogConfig.minHeight = '50%';
    fakeDialogConfig.disableClose = true;
    fakeDialogConfig.data = gateway;
    app.editGatewayModal(gateway);

    expect(modalServiceSpy.open).toHaveBeenCalledWith(ManageGatewayComponent, fakeDialogConfig);
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
  })

  it('should open gateway devices modal', () => {
    let gateway = new GatewayModel('serial', 'name', '12.32.12.43', []);

    let dialogConfig = new MatDialogConfig;
    dialogConfig.panelClass = 'gateway-devices-dialog';
    dialogConfig.maxHeight = '80%';
    dialogConfig.maxWidth = '80%';
    dialogConfig.minWidth = '400px';
    dialogConfig.minHeight = '50%';
    dialogConfig.data = {devices: gateway.devices, gateway: gateway};
    app.openGatewayDevices(gateway);

    expect(modalServiceSpy.open).toHaveBeenCalledWith(ManageDeviceComponent, dialogConfig);
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
  })

});
