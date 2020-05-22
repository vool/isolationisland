/*____                                                ______                  _________
___      ________ ____________  /_        _____  ________ ____  __________       ___  /_ ______ ________ ______  /________
__ | /| / /_  __ `/__  ___/__  __ \       __  / / /_  __ \_  / / /__  ___/       __  __ \_  __ `/__  __ \_  __  / __  ___/
__ |/ |/ / / /_/ / _(__  ) _  / / /       _  /_/ / / /_/ // /_/ / _  /           _  / / // /_/ / _  / / // /_/ /  _(__  )
____/|__/  \__,_/  /____/  /_/ /_/        _\__, /  \____/ \__,_/  /_/            /_/ /_/ \__,_/  /_/ /_/ \__,_/   /____/
                                          /____*/


function stay_at_home() {

  var sidebar, overlayMaps, layerControl;

  var gkey = 'AIzaSyAlaaeJwtndDUhIlIk736P_Hku5NBdCquc';
  var gdbkey = '6db070f0-7c27-11ea-8264-e974339fc182';

  var siteData = [];
  var icons = [];

  var coverageLayer;
  var marker;

  return {
    showLocationModal: false,
    locationModalStatus: '',
    radius: 5000,
    //error: null,
    sites: null,
    map: null,
    siteData: [],
    subGroup: [],
    loc: {
      lat: null,
      lng: null
    },

    poi: {
      title: '',
      details: 'Select a marker to view details.'
    },

    get_coords(dis, callback) {

      //If HTML5 Geolocation Is Supported In This Browser
      if (navigator.geolocation) {
        //Use HTML5 Geolocation API To Get Current Position
        // try high accuracy location for 5 seconds
        navigator.geolocation.getCurrentPosition(function(position) {
            //Get Latitude From Geolocation API
            var lat = position.coords.latitude;
            //Get Longitude From Geolocation API
            var lng = position.coords.longitude;
            window.console && console.log('coords : latitude=' + lat + ", longitude=" + lng);
            callback(["coords", lat, lng]);
          },
          function(error) {

            if (error.code == error.TIMEOUT) {
              // Attempt to get GPS loc timed out after 5 seconds,
              // try low accuracy location for 10 seconds
              navigator.geolocation.getCurrentPosition(function(position) {
                  //Get Latitude From Geolocation API
                  var lat = position.coords.latitude;
                  //Get Longitude From Geolocation API
                  var lng = position.coords.longitude;
                  window.console && console.log('coords : latitude=' + lat + ", longitude=" + lng);
                  callback(dis, ["coords", lat, lng]);
                },
                function(error) {
                  if (error.code == 1) {
                    window.console && console.log('low accuracy geoloc_deactivated');
                    callback(dis, ["geoloc_deactivated"]);
                  } else if (error.code == 2) {
                    window.console && console.log('low accuracy position_unavailable');
                    callback(dis, ["position_unavailable"]);
                  } else if (error.code == 3) {
                    window.console && console.log("low accuracy timeout");
                    callback(dis, ["timeout"]);
                  }
                }, {
                  maximumAge: 600000,
                  timeout: 10000,
                  enableHighAccuracy: false
                });
            }
            if (error.code == 1) {
              window.console && console.log('high accuracy geoloc_deactivated');
              callback(dis, ["geoloc_deactivated"]);
            } else if (error.code == 2) {
              window.console && console.log('high accuracy position_unavailable');

              dis.locationModalStatus += "... high accuracy position_unavailable";

              callback(dis, ["position_unavailable"]);

            }

          }, {
            maximumAge: 600000,
            timeout: 5000,
            enableHighAccuracy: true
          });
      } else {
        window.console && console.log("geoloc_not_supported");
        callback(["geoloc_not_supported"]);
      }
    },

    wash_your_hands() {
      console.log("init");
      this.initLoc();
    },

    getRadius() {
      return this.radius;
    },
    setRadius(rad) {
      radius = rad;
      return radius;
    },
    setLoc(latLng, set_url = true) {

      this.loc = latLng;

      if (set_url) {
        history.pushState(null, null, '/?lat=' + latLng.lat + '&lng=' + latLng.lng);
      }

      return this.loc;

    },

    geoFindBtn() {

      console.log("doing geo find...");

      cb = function(callback) {

        if (Array.isArray(callback) && callback[0] == "coords") {

          var loc = {
            lat: callback[1],
            lng: callback[2]
          }
          this.setLoc(loc);
          this.showLocationModal = false
          this.initMap()

        } else {

          var loc = this.geoFindByIp();

          if (loc) {

            this.setLoc(loc);

            this.showLocationModal = false
            this.initMap()

          } else {

            Swal.fire(
              '',
              'Could not set your location :(',
              'error'
            )

          }

        }

      };

      this.get_coords(this, cb.bind(this));

    },

    geoFindByIp() {

      console.log("doing geo find by IP...");

      var url = "https://geolocation-db.com/json/" + gdbkey;

      var result = L.latLng(0, 0);

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
          var geoip_response = JSON.parse(xhr.responseText);
          result.lat = geoip_response.latitude;
          result.lng = geoip_response.longitude;
        } else {
          console.log("geoFindByIP failed because its XMLHttpRequest got this response: " + xhr.status);
        }
      };
      xhr.send();
      return result;
    },

    setLocGeoBtn() {

      console.log("doing geo find...");

      cb = function(callback) {

        if (Array.isArray(callback) && callback[0] == "coords") {

          var loc = {
            lat: callback[1],
            lng: callback[2]
          }
          this.setLoc(loc);
          this.initMap()

        } else {

          Swal.fire(
            '',
            'Could not set your location by GPS :(',
            'error'
          )

        }

      };

      this.get_coords(this, cb.bind(this));

    },

    setLocManualBtn() {

      this.map.removeLayer(this.coverageLayer);
      this.map.removeLayer(this.sites);

      sidebar.close();

      Swal.fire(
        '',
        'Click on the map to set your location'
      )


      this.map.on('click', this.setMarkerLocation.bind(this));

    },

    setMarkerLocation(e) {

      this.setLoc(e.latlng);

      this.map.off('click');

      this.loadData();

      this.coverageLayer.setData([
        [this.loc.lat, this.loc.lng],
      ]);

      this.map.addLayer(this.coverageLayer);
      this.map.addLayer(this.sites);

    },


    initLoc() {
      console.log("init loc");

      var url = new URL(document.URL);

      // if lat && loc params are set
      if (url.searchParams.has('lat') && url.searchParams.has('lng')) {
        console.log("latLng set in url !")

        this.loc.lat = parseFloat(url.searchParams.get('lat'));
        this.loc.lng = parseFloat(url.searchParams.get('lng'));

        this.initMap();

        return true;

      } else {
        console.log("loc not set");

        this.showLocationModal = true;

      }

    },

    initMap() {

      console.log('init map');

      //============
      // Base Layers

      var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">hotosm</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM Fr</a>'
      });

      this.coverageLayer = new L.GridLayer.MaskCanvas({
        opacity: 1,
        radius: this.radius,
        useAbsoluteRadius: true,
        color: '#90CCCB'
      });
      // todo ???
      this.coverageLayer.setData([
        [this.loc.lat, this.loc.lng],
      ]);

      // coverageLayer.setData(
      //   [this.loc]
      // );

      this.map = new L.Map('map', {
        //center: new L.LatLng(lat, lng),
        center: this.loc,
        //center: loc,
        zoom: 13,
        layers: [osm]
      });

      this.map.addLayer(this.coverageLayer);

      // scale
      L.control.scale({
        'imperial': false
      }).addTo(this.map);

      // zoom control
      // L.control
      //   .zoom({
      //     position: "topleft"
      //   })
      //   .addTo(map);

      // market cluster group
      this.sites = new L.MarkerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      });

      sidebar = L.control.sidebar({
        container: "sidebar",
        position: "right"
      });

      sidebar.addTo(this.map);

      layerControl = L.control.layers(null, null, {
        collapsed: false
      }).addTo(this.map);

      icons['smr'] = new L.Icon({
        iconUrl: '/img/leaflet/marker-icon-green.png',
        shadowUrl: '/img/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      icons['niah'] = new L.Icon({
        iconUrl: '/img/leaflet/marker-icon-red.png',
        shadowUrl: '/img/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      icons['wreck'] = new L.Icon({
        iconUrl: '/img/leaflet/marker-icon-yellow.png',
        shadowUrl: '/img/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });


      // add site layer to map
      this.map.addLayer(this.sites);

      // show sidebar
      //sidebar.show(); // why no worky ?
      // css hack
      document.getElementById("sidebar").style.display = "block";

      this.subGroup['smr'] = L.featureGroup.subGroup(this.sites);
      this.subGroup['wrecks'] = L.featureGroup.subGroup(this.sites);
      this.subGroup['niah'] = L.featureGroup.subGroup(this.sites);

      layerControl.addOverlay(this.subGroup['smr'], 'NMS Sites and Monuments Record');
      layerControl.addOverlay(this.subGroup['wrecks'], 'NMS Wreck database');
      layerControl.addOverlay(this.subGroup['niah'], 'National Inventory of Architectural Heritage');

      this.subGroup['smr'].addTo(this.map);
      this.subGroup['wrecks'].addTo(this.map);
      this.subGroup['niah'].addTo(this.map);

      this.loadData();

    },

    shareTwitter() {

      if (navigator.share) {
        navigator.share({
            title: 'Isolation Island',
            text: 'Check out my Isolation Island map %23COVID19Ireland %232kmfromhome&related=tweetphelan', // todo related ?
            url: window.location.href,
          })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        window.open("https://twitter.com/share?url=" + encodeURIComponent(window.location.href) + "&text=Check out my Isolation Island map %23COVID19Ireland %232kmfromhome&related=tweetphelan", '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        return false;
      }

    },

    loadData(reset = false) {

      // reset data
      this.siteData = [];

      fetch(`getSites.php?lat=${this.loc.lat}&lng=${this.loc.lng}&table=smr&radius=${this.radius}`)
        .then((res) => res.json())
        .then((data) => {

          this.subGroup['smr'].clearLayers();

          this.siteData['smr'] = data;

          for (var i = 0; i < data.length; i++) {

            var name = data[i].CLASSDESC;

            var location = new L.LatLng(data[i].lat, data[i].lng);

            var id = data[i].index;
            var lat = data[i].Lat;
            var lng = data[i].lng;

            var marker = new L.Marker(location, {
              title: name,
              // id : id,
              lat: lat,
              lng: lng,
              icon: icons['smr'],
              type: 'smr',
              index: i
            });

            marker.on('click', this.markerClick.bind(this));

            this.subGroup['smr'].addLayer(marker);

          }

          console.log("SMR loaded...")

        });

      fetch(`getSites.php?lat=${this.loc.lat}&lng=${this.loc.lng}&table=niah&radius=${this.radius}`)
        .then((res) => res.json())
        .then((data) => {

          this.subGroup['niah'].clearLayers();
          this.siteData['niah'] = data;

          for (var i = 0; i < data.length; i++) {

            var name = data[i].NAME;

            var location = new L.LatLng(data[i].lat, data[i].lng);

            var id = data[i].index;
            var lat = data[i].Lat;
            var lng = data[i].lng;

            var marker = new L.Marker(location, {
              title: name,
              // id : id,
              lat: lat,
              lng: lng,
              icon: icons['niah'],
              type: 'niah',
              index: i //temp should be id not index
            });

            marker.on('click', this.markerClick.bind(this));

            this.subGroup['niah'].addLayer(marker);

          }

          console.log("NIAH loaded...")

        });

      fetch(`getSites.php?lat=${this.loc.lat}&lng=${this.loc.lng}&table=wrecks&radius=${this.radius}`)
        .then((res) => res.json())
        .then((data) => {

          this.subGroup['wrecks'].clearLayers();
          this.siteData['wrecks'] = data;

          for (var i = 0; i < data.length; i++) {

            var name = data[i].name;

            var location = new L.LatLng(data[i].lat, data[i].lng);

            var id = data[i].index;
            var lat = data[i].Lat;
            var lng = data[i].lng;

            var marker = new L.Marker(location, {
              title: name,
              // id : id,
              lat: lat,
              lng: lng,
              icon: icons['wreck'],
              type: 'wrecks',
              index: i //temp should be id not index
            });

            marker.on('click', this.markerClick.bind(this));


            this.subGroup['wrecks'].addLayer(marker);

          }

          console.log("wrecks loaded...")

        });
    },

    markerClick(e) {
      this.showDetails(e.target.options.type, e.target.options.index);
    },

    showDetails(type, index) {

      switch (type) {
        case 'niah':

          var title = this.siteData[type][index].NAME;

          var details = `
          <img src="${this.siteData[type][index].IMAGE_LINK}" style="width:100%">
          <table>
            <tr>
              <td>
                Address:
              </td>
              <td>
                <b>${this.siteData[type][index].STREET1},<br> ${this.siteData[type][index].TOWN},<br> ${this.siteData[type][index].COUNTY}</b>
              </td>
            </tr>
            <tr>
              <td>
                Original Use:
              </td>
              <td>
                <b>${this.siteData[type][index].ORIGINAL_TYPE}</b>
              </td>
            </tr>
            <tr>
              <td>
                Date:
              </td>
              <td>
                <b>${this.siteData[type][index].DATEFROM} - ${this.siteData[type][index].DATETO}</b>
              </td>
            </tr>
            <tr>
              <td>
                Composition:
              </td>
              <td>
                <b>${this.siteData[type][index].COMPOSITION}</b>
              </td>
            </tr>
            <tr>
              <td>
                Distance:
              </td>
              <td>
                <b>${Number(this.siteData[type][index].distance).toFixed(2)}km</b>
              </td>
            </tr>
            <tr>
              <td>
                Link:
              </td>
              <td>
                <b><a href="${this.siteData[type][index].WEBSITE_LINK}" target="_blank">Link<a></b>
              </td>
            </tr>
          </table>
    `;

          break;

        case ('smr'):

          //check if webnotes have been loaded for site
          if (!this.siteData[type][index].WEBNOTES) {

            fetch(`https://webservices.archaeology.ie/arcgis/rest/services/NM/NationalMonuments/MapServer/0/query?f=json&where=SMRS%20LIKE%20%27${this.siteData[type][index].SMRS}%27&outFields=WEBNOTES&returnGeometry=false`)
              .then((res) => res.json())
              .then((data) => {

                this.siteData[type][index].WEBNOTES = data.features[0]['attributes']['WEBNOTES']

              });

          }

          var title = this.siteData[type][index].CLASSDESC;

          var details = `
          <table>
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=${this.siteData[type][index].lat},${this.siteData[type][index].lng}&zoom=18&size=400x300&&maptype=satellite&markers=color:red|anchor:center|${this.siteData[type][index].lat},${this.siteData[type][index].lng}&key=${gkey}" />
            <tr>
              <td>
                Class Description:
              </td>
              <td>
                <b>${this.siteData[type][index].CLASSDESC}</b>
              </td>
            </tr>
            <tr>
              <td>
                Townland:
              </td>
              <td>
                <b>${this.siteData[type][index].TLAND_NAMES}</b>
              </td>
            </tr>

            <tr>
              <td>
                Notes:
              </td>
              <td>
                <b id="webnotes" x-text="siteData['${type}'][${index}].WEBNOTES"></b>
              </td>
            </tr>

            <tr>
              <td>
                Distance:
              </td>
              <td>
                <b>${Number(this.siteData[type][index].distance).toFixed(2)}km</b>
              </td>
            </tr>

            <tr>
              <td>
                Link:
              </td>
              <td>
                <b><a href="${this.siteData[type][index].Link}" target="_blank">Link<a></b>
              </td>
            </tr>
          </table>`;

          break;

        case ('wrecks'):

          var title = this.siteData[type][index].name;

          var details = `
          <table>
            <tr>
              <td>
                Name:
              </td>
              <td>
                <b>${this.siteData[type][index].name}</b>
              </td>
            </tr>
            <tr>
              <td>
                Classification:
              </td>
              <td>
                <b>${this.siteData[type][index].Classification}</b>
              </td>
            </tr>

            <tr>
              <td>
                Place of Loss:
              </td>
              <td>
                <b>${this.siteData[type][index].Place_of_Loss}</b>
              </td>
            </tr>

            <tr>
              <td>
                Date of Loss:
              </td>
              <td>
                <b>${this.siteData[type][index].Date_of_Loss}</b>
              </td>
            </tr>

            <tr>
              <td>
                Description:
              </td>
              <td>
                <b>${this.siteData[type][index].Description}</b>
              </td>
            </tr>
            <tr>
              <td>
                Distance:
              </td>
              <td>
                <b>${Number(this.siteData[type][index].distance).toFixed(2)}km</b>
              </td>
            </tr>
          </table>`;

          break;
        default:

      }

      this.poi.title = title;

      this.poi.details = details;

      sidebar.open('profile');
    }

  }

}
