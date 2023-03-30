import {GatewayService} from "./gateway.service";
import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {DeviceModel, GatewayModel} from "../models/gateway.model";
import {expect} from "@angular/flex-layout/_private-utils/testing";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {asyncData, asyncError} from "../testing/async_helpers";

const newGateway = new GatewayModel('serial', 'name', '12.12.12.12', []);

describe('GatewayService', () => {
  let gatewayService: GatewayService;
  let controller: HttpTestingController;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GatewayService],
    });
    controller = TestBed.inject(HttpTestingController);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    gatewayService = new GatewayService(httpClientSpy);
  });

  it('create a gateway', () => {
    const gateway = {
      ip_address: '12.12.12.12',
      serial: 'serial',
      devices: 'devices',
      name: 'name',
      _id: 'gatewayRandomId',
    };

    httpClientSpy.post.and.returnValue(asyncData(gateway));

    gatewayService.createGateway(newGateway).subscribe(
      (response) => {
        expect(response).toEqual(gateway);
      },
      (error) => {
      },
    );
    expect(httpClientSpy.post.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('create a gateway error', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
      error: '12.12.12.text is not a valid IPv4 address!',
      status: 400, statusText: 'Bad request'
    });
    httpClientSpy.post.and.returnValue(asyncError(errorResponse));

    gatewayService.createGateway(newGateway).subscribe(
      (resp) => {
        fail('next handler must not be called');
      },
      (error) => {
        expect(error).toContain('12.12.12.text is not a valid IPv4 address!');
        done();
      }
    );

    // expect(actualError?.status).toBe(status);
    // expect(actualError?.statusText).toEqual(statusText);
  });

  it('update a gateway', (done: DoneFn) => {
    newGateway.ip_address = '13.13.13.13';
    const gateway = {
      ip_address: '13.13.13.13',
      serial: 'serial',
      devices: 'devices',
      name: 'name',
      _id: 'gatewayRandomId',
    };

    httpClientSpy.put.and.returnValue(asyncData(gateway));

    gatewayService.updateGateway(newGateway, 'gatewayRandomId').subscribe(
      (response) => {
        expect(response).toEqual(gateway);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.put.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('update a gateway error', (done: DoneFn) => {
    newGateway.ip_address = '13.13.13.text';
    const errorResponse = new HttpErrorResponse({
      error: '13.13.13.text is not a valid IPv4 address!',
      status: 400, statusText: 'Bad request'
    });
    httpClientSpy.put.and.returnValue(asyncError(errorResponse));

    gatewayService.updateGateway(newGateway, 'gatewayRandomId').subscribe(
      (resp) => {
        fail('next handler must not be called');
      },
      (error) => {
        expect(error).toContain('13.13.13.text is not a valid IPv4 address!');
        done();
      }
    );
  });

  it('get a list of gateways', (done: DoneFn) => {
    const gateway = {
      ip_address: '13.13.13.13',
      serial: 'serial',
      devices: 'devices',
      name: 'name',
      _id: 'gatewayRandomId',
    };

    httpClientSpy.get.and.returnValue(asyncData([gateway, gateway]));

    gatewayService.getGateways().subscribe(
      (response) => {
        expect(response).toEqual([gateway, gateway]);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('remove a gateway', (done: DoneFn) => {
    newGateway._id = 'gatewayRandomId';
    httpClientSpy.delete.and.returnValue(asyncData({}));

    gatewayService.deleteGateway(newGateway).subscribe(
      (response) => {
        expect(response).toEqual({});
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.delete.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('create a device', (done: DoneFn) => {
    newGateway._id = 'gatewayRandomId';
    const device = new DeviceModel('uid', 'Intel', 'online');
    httpClientSpy.post.and.returnValue(asyncData(device));
    gatewayService.createGatewayDevice(newGateway, device).subscribe(
      (response) => {
        expect(response).toEqual(device);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.post.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('update devices', (done: DoneFn) => {
    newGateway._id = 'gatewayRandomId';
    const device = new DeviceModel('uid', 'Intel', 'online');
    httpClientSpy.put.and.returnValue(asyncData([device, device]));
    gatewayService.updateGatewayDevices(newGateway, [device, device]).subscribe(
      (response) => {
        expect(response).toEqual([device, device]);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.put.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('get a list of devices', (done: DoneFn) => {
    newGateway._id = 'gatewayRandomId';
    const device = new DeviceModel('uid', 'Intel', 'online');
    httpClientSpy.get.and.returnValue(asyncData([device, device]));

    gatewayService.getGatewayDevices(newGateway).subscribe(
      (response) => {
        expect(response).toEqual([device, device]);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('get a device details', (done: DoneFn) => {
    newGateway._id = 'gatewayRandomId';
    const device = new DeviceModel('uid', 'Intel', 'online');
    httpClientSpy.get.and.returnValue(asyncData(device));

    gatewayService.getGatewayDevice(newGateway, device).subscribe(
      (response) => {
        expect(response).toEqual(device);
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('delete a device', (done: DoneFn) => {
    const device = new DeviceModel('uid', 'Intel', 'online');
    httpClientSpy.delete.and.returnValue(asyncData({}));

    gatewayService.deleteGatewayDevice(newGateway, device).subscribe(
      (response) => {
        expect(response).toEqual({});
        done();
      },
      (error) => {
      },
    );
    expect(httpClientSpy.delete.calls.count())
      .withContext('one call')
      .toBe(1);
  });

});
