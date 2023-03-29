import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, retry, throwError} from "rxjs";
import {DeviceModel, GatewayModel} from "../models/gateway.model";


@Injectable({providedIn: 'root'})
export class GatewayService {
  constructor(private $http: HttpClient) {}

  createGateway(gateway: GatewayModel): Observable<GatewayModel> {
    const endpoint = `gateways`;
    return this.$http.post<GatewayModel>(endpoint, gateway).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  updateGateway(gateway: GatewayModel, gatewayId: string): Observable<GatewayModel> {
    const endpoint = `gateways/${gatewayId}`;
    return this.$http.put<GatewayModel>(endpoint, gateway).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  getGateways(): Observable<GatewayModel[]> {
    return this.$http.get<GatewayModel[]>('gateways').pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  deleteGateway(gateway: GatewayModel) {
    return this.$http.delete(`gateways/${gateway._id}`).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  createGatewayDevice(gateway: GatewayModel, device: DeviceModel): Observable<DeviceModel> {
    const endpoint = `gateways/${gateway._id}/devices`;
    return this.$http.post<DeviceModel>(endpoint, device).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  updateGatewayDevices(gateway: GatewayModel, devices: DeviceModel[]): Observable<DeviceModel[]> {
    const endpoint = `gateways/${gateway._id}/devices`;
    return this.$http.put<DeviceModel[]>(endpoint, {devices}).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  getGatewayDevices(gateway: GatewayModel): Observable<DeviceModel[]> {
    const endpoint = `gateways/${gateway._id}/devices`;
    return this.$http.get<DeviceModel[]>(endpoint).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  getGatewayDevice(gateway: GatewayModel, device: DeviceModel): Observable<DeviceModel> {
    const endpoint = `gateways/${gateway._id}/devices/${device._id}`;
    return this.$http.get<DeviceModel>(endpoint).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  deleteGatewayDevice(gateway: GatewayModel, device: DeviceModel) {
    const endpoint = `gateways/${gateway._id}/devices/${device._id}`;
    return this.$http.delete(endpoint).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
