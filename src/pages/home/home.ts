import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, PopoverController, LoadingController, Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DetailPage } from '../detail/detail';
import { PopoverPage } from '../popover/popover';
import { DriverServiceProvider } from '../../providers/driver-service/driver-service';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import { BackgroundMode } from '@ionic-native/background-mode';
import { AppMinimize } from '@ionic-native/app-minimize';

/**
 * Generated class for the HomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [DriverServiceProvider]
})

export class HomePage {
  driver_id: number;
  status_array: {
    "2": string,
    "3": string,
    "4": string,
    "5": string
  };

  items: Array<{
    id: number,
    shipment_title: string,
    shipment_information: string,
    shipment_length: number,
    shipment_status: number,
    status_array: any,
    status_text: string,
    additional_class: string,
    location_from_address: string,
    location_from_city: string,
    location_from_lat: number,
    location_from_lng: number,
    location_to_address: string,
    location_to_city: string,
    location_to_lat: number,
    location_to_lng: number
  }>;
  loader: any;
  emptyState: boolean;
  errorState: boolean;

  constructor(public navCtrl: NavController, public menu: MenuController, public navParams: NavParams, public popoverCtrl: PopoverController, public driverService: DriverServiceProvider, public loading: LoadingController, public storage: Storage, public locationTracker: LocationTrackerProvider, public backgroundMode: BackgroundMode, public appMinimize: AppMinimize, private platform: Platform, public toast: ToastController) {
    this.menu.enable(true);

    this.platform.registerBackButtonAction(() => {
      this.appMinimize.minimize();
    });

    this.backgroundMode.on("activate").subscribe(() => {
      this.backgroundMode.disableWebViewOptimizations();
    });
    this.backgroundMode.enable();
    this.backgroundMode.setDefaults({
      title: "Yukirim",
      text: "is running in background",
      resume: true
    });

    this.emptyState = false;
    this.errorState = false;
    this.status_array = {
      "2": "Pesanan",
      "3": "Dikirim",
      "4": "Diambil",
      "5": "Diterima"
    };

    this.startTracking();
  }

  ionViewDidLoad() {
    this.loader = this.loading.create({
      content: "sedang refresh data..."
    });
    this.loader.present();

    this.storage.get("driver_id").then((value) => {
      this.driver_id = value;
      this.loadItems();
    });
    
    /*this.items = [
      {id: 1, shipment_title: "Kirim furniture", location_from_city: "Surabaya", location_to_city: "Jakarta"},
      {id: 2, shipment_title: "kitchen furniture", location_from_city: "Surabaya", location_to_city: "Malang"},
      {id: 3, shipment_title: "Bedroom Set", location_from_city: "Jakarta", location_to_city: "Bali"}
    ];*/
  }

  startTracking() {
    this.locationTracker.startTracking();
  }

  stopTracking() {
    this.locationTracker.stopTracking();
  }

  presentToast(message) {
    let toast = this.toast.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

  presentPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: ev
    });
  }

  loadItems(refresher = null) {
    this.driverService.load(refresher)
      .then(result => {
        if (refresher) {
          refresher.complete();
        }

        if (this.loader) {
          this.loader.dismiss();
        }

        if (result.status == "success") {
          this.errorState = false;
          var iLength = result.data.length;
          for (var i = 0; i < iLength; i++) {
            var item = result.data[i];
            this.items = [
              {
                id: item.shipment_id,
                shipment_title: item.shipment_title,
                shipment_information: item.shipment_information,
                shipment_length: parseInt(item.shipment_length),
                shipment_status: item.shipment_status,
                status_array: this.status_array,
                status_text: this.status_array[item.shipment_status + ""],
                additional_class: "badge-status-" + this.status_array[item.shipment_status + ""],
                location_from_address: item.location_from_address,
                location_from_city: item.location_from_city,
                location_from_lat: item.location_from_lat,
                location_from_lng: item.location_from_lng,
                location_to_address: item.location_to_address,
                location_to_city: item.location_to_city,
                location_to_lat: item.location_to_lat,
                location_to_lng: item.location_to_lng
              }
            ];
          }

          if (iLength == 0) {
            this.emptyState = true;
          } else {
            this.emptyState = false;
          }
        } else {
          this.errorState = true;
          this.emptyState = true;
          this.presentToast(result.errorName + ": " + result.errorMessage);
        }
      });
  }

  refreshData(refresher) {
    this.loadItems(refresher);
  }

  itemClick(event, item) {
    this.navCtrl.push(DetailPage, {
      item: item
    });
  }
}
