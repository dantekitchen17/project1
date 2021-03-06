import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';

/*
  Generated class for the DriverServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DriverServiceProvider {
  id: number;
  token: string;
  data: any;
  requestLoad: boolean = false;

  constructor(public http: Http, public storage: Storage) {
    this.data = {};
    this.id = null;
    this.token = null;
  }

  load(reload = false):any {
    return new Promise((resolve, reject) => {
      if (this.token != null) {
        this.doLoad(reload).then((value) => {
          resolve(value);
        });
      } else {
        Promise.all([
          this.storage.get("device_id"),
          this.storage.get("token")
        ]).then((value) => {
          this.id = value[0];
          this.token = value[1];
          this.doLoad(reload).then((value) => {
            resolve(value);
          });
        });
      }
    });
    
  }

  doLoad(reload) {
    if (!reload) {
      if (this.data.data) {
        return Promise.resolve(this.data);
      }
    }

    return new Promise(resolve => {
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      let options = new RequestOptions({headers: headers});
      
      let urlSearchParams = new URLSearchParams();
      urlSearchParams.append("token", this.token);
      let body = urlSearchParams.toString();
      this.http.post('http://yukirim.wahanafurniture.com/api/device/' + this.id, body, options)
        .timeout(10000)
        .subscribe(data => {
          if (data.status == 200) {
            var result = JSON.parse(data.text());
            this.data.status = "success";
            if (result.length > 0) {
              this.data.status = result[0].result;
            }
            this.data.data = result;
            resolve(this.data);
          } else {
            this.data = {
              status: "error_connection",
              errorName: "Error",
              errorMessage: "Tidak bisa terkoneksi ke server"
            };
            resolve(this.data);
          }
        });
    });
  }
}
