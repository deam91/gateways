export class GatewayModel {
  _id: string | undefined;
  serial: string | undefined;
  name: string | undefined;
  ip_address!: string;
  devices: DeviceModel[] | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(serial: string | undefined, name: string | undefined, ip_address: string, devices: DeviceModel[] | undefined, id: string|undefined = undefined) {
    this.ip_address = ip_address;
    this.serial = serial;
    this.devices = devices;
    this.name = name;
    this._id = id;
  }
}

export class DeviceModel {
  _id: string | undefined;
  uid: string;
  vendor: string;
  status: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(uid: string | undefined, vendor: string | undefined, status: string | undefined) {
    this.status = status ?? '';
    this.uid = uid ?? '';
    this.vendor = vendor ?? '';
  }
}
