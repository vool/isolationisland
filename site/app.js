                           /*____                                                ______                  _________
___      ________ ____________  /_        _____  ________ ____  __________       ___  /_ ______ ________ ______  /________
__ | /| / /_  __ `/__  ___/__  __ \       __  / / /_  __ \_  / / /__  ___/       __  __ \_  __ `/__  __ \_  __  / __  ___/
__ |/ |/ / / /_/ / _(__  ) _  / / /       _  /_/ / / /_/ // /_/ / _  /           _  / / // /_/ / _  / / // /_/ /  _(__  )
____/|__/  \__,_/  /____/  /_/ /_/        _\__, /  \____/ \__,_/  /_/            /_/ /_/ \__,_/  /_/ /_/ \__,_/   /____/
                                          /____*/



var app = (function() {
  // Let's make sure no one can directly access our songList
  //var songList = ['California Girls', 'California Dreaming', 'Hotel California'];

  // map el
  var map, sites, sidebar, overlayMaps, loc, layerControl;

  var rad = 2000;

  var gkey = 'AIzaSyAlaaeJwtndDUhIlIk736P_Hku5NBdCquc';
  var gdbkey = '6db070f0-7c27-11ea-8264-e974339fc182';

  var siteData = [];
  var icons = [];
  var subGroup = [];
  //var overlayMaps = [];



  function initMap() {
    console.log('init map');

    //============
    // Base Layers

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">hotosm</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM Fr</a>'
});

    var coverageLayer = new L.GridLayer.MaskCanvas({
      opacity: 1,
      radius: rad,
      useAbsoluteRadius: true,
      color: '#90CCCB'
    });

    coverageLayer.setData([
      [loc.lat, loc.lng],
    ]);

    map = new L.Map('map', {
      //center: new L.LatLng(lat, lng),
      center: loc,
      //center: loc,
      zoom: 14,
      layers: [osm]
    });

    map.addLayer(coverageLayer);

    // scale
    L.control.scale({
      'imperial': false
    }).addTo(map);

    // zoom control
    // L.control
    //   .zoom({
    //     position: "topleft"
    //   })
    //   .addTo(map);

    // market cluster group
    sites = new L.MarkerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });



    sidebar = L.control.sidebar({
      container: "sidebar",
      position: "right"
    });
    sidebar.addTo(map);

    //sidebar.hide();
    // subGroup['smr'] = L.featureGroup.subGroup(sites);
    // //L.featureGroup();
    // subGroup['niah'] = L.featureGroup.subGroup(sites);
    // //L.featureGroup();
    //
    // subGroup['wrecks'] = L.featureGroup.subGroup(sites);
    // subGroup['smr'].addTo(map);
    // subGroup['niah'].addTo(map);
    // subGroup['wrecks'].addTo(map);

    // overlayMaps = {
    //   //"NMS Sites and Monuments Record": subGroup['smr'],
    //   //"National Inventory of Architectural Heritage": subGroup['niah'],
    // //  "NMS Wreck database ": subGroup['wrecks']
    // };
    //
    // L.control.layers(null, overlayMaps, {
    //   collapsed: false
    // }).addTo(map);

    layerControl = L.control.layers(null, null, {
      collapsed: false
    }).addTo(map);

    //
    // L.control
    //   .zoom({
    //     position: "topright"
    //   })
    //   .addTo(map);


    // set icons

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
    map.addLayer(sites);

    // show sidebar
    //sidebar.show(); // why no worky ?
    // css hack
    document.getElementById("sidebar").style.display = "block";


    loadData();


  }


  function getLoc() {
    //return loc;
    return loc;
  }

  function loadData() {


    $.getJSON("getSites.php?lat=" + loc.lat + "&lng=" + loc.lng + "&table=smr&radius=" + rad, function(data) {

      subGroup['smr'] = L.featureGroup.subGroup(sites);




      siteData['smr'] = data;

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

        //       var details = `
        //
        //
        //               <h2 class="color-brown mb-3">${name}</h2>
        //
        //                     <img src="${data[i].IMAGE_LINK}"/>
        //                               <div class="row">
        //                   <div class="col-5"><p>Reg No</p></div>
        //                   <div class="col-7"><p><strong>21003042</strong></p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>Rating</p></div>
        //                   <div class="col-7"><p><strong>Regional</strong></p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>Categories of Special Interest</p></div>
        //                   <div class="col-7"><p><strong>Architectural</strong></p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>Original Use</p></div>
        //                   <div class="col-7"><p>Store/warehouse</p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>In Use As</p></div>
        //                   <div class="col-7"><p>Laundry</p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //                             <div class="row">
        //                   <div class="col-5"><p>Date</p></div>
        //                   <div class="col-7"><p>1875 - 1880</p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>Date Recorded</p></div>
        //                   <div class="col-7"><p>19/09/2005</p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        //                               <div class="row">
        //                   <div class="col-5"><p>Date Updated</p></div>
        //                   <div class="col-7"><p>--/--/--</p></div>
        //                   <hr class="mx-3">
        //                 </div>
        //
        // `;

        marker.on('click', function(e) {

          showDetails(e.target.options.type, e.target.options.index);
          //alert(909);
          //
          // $('#details').html(details);
          //
          // sidebar.open('home');

        });

        subGroup['smr'].addLayer(marker);

      }
    }).complete(function() {

      console.log("SMR loaded...")

      layerControl.addOverlay(subGroup['smr'], 'NMS Sites and Monuments Record');

      subGroup['smr'].addTo(map);

    });




    $.getJSON("getSites.php?lat=" + loc.lat + "&lng=" + loc.lng + "&table=niah&radius=" + rad, function(data) {

      siteData['niah'] = data;
      subGroup['niah'] = L.featureGroup.subGroup(sites);

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

        marker.on('click', function(e) {

          showDetails(e.target.options.type, e.target.options.index);

        });

        subGroup['niah'].addLayer(marker);

      }
    }).complete(function() {

      console.log("NIAH loaded...")
      subGroup['niah'].addTo(map);
      layerControl.addOverlay(subGroup['niah'], 'National Inventory of Architectural Heritage');
    });


    $.getJSON("getSites.php?lat=" + loc.lat + "&lng=" + loc.lng + "&table=wrecks&radius=" + rad, function(data) {

      siteData['wreck'] = data;
      subGroup['wrecks'] = L.featureGroup.subGroup(sites);


      for (var i = 0; i < data.length; i++) {
        //console.log(data[i].name);

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
          type: 'wreck',
          index: i //temp should be id not index
        });

        marker.on('click', function(e) {

          showDetails(e.target.options.type, e.target.options.index);

        });

        subGroup['wrecks'].addLayer(marker);

      }
    }).complete(function() {

      console.log("wrecks loaded...")

      layerControl.addOverlay(subGroup['wrecks'], 'NMS Wreck database');

      subGroup['wrecks'].addTo(map);

    });

    //done loading data

    // console.log(overlayMaps);
    //
    // L.control.layers(null, overlayMaps, {
    //   collapsed: false
    // }).addTo(map);
    //
    // layerControl.addBaseLayer(overlayMaps, 'My New BaseLayer');



  }


  function geoFind() {

    console.log("doing geo find...");

    const status = document.querySelector('#geo-status');


    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      status.textContent = '';

      status.innerHTML += "<br>Found you...";
      console.log("Found you...aa");


      var loc = {
        lat: parseFloat(position.coords.latitude),
        lng: parseFloat(position.coords.longitude)
      };

      setLoc(loc, true);

      MicroModal.close('location-modal');
      //
      // alert(loc);
      initMap();



      return true;


    }

    function error() {
      status.innerHTML += "<br>Unable to retrieve your location...";
      console.log("Unable to retrieve your location...");

      status.innerHTML += "<br>Locating your IP...";

      var pos = geoFindByIp();

      var loc = {
        lat: parseFloat(pos.lat),
        lng: parseFloat(pos.lng)
      };

      setLoc(loc, true);

      if (setLoc(pos)) {

        if (getLoc()) {


          status.innerHTML += "<br>Found you...";
          console.log("Found you... b");


          MicroModal.close('location-modal');
          //
          // alert(loc);
          initMap();

          return true;
        } else {
          return false;
        }
      };

      return true;

    }

    if (!navigator.geolocation) {
      status.innerHTML += "Geolocation is not supported by your browser...";
      return false;
    } else {
      status.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(success, error);

    }

    //return loc;
  }

  function gerror(t) {

    status.innerHTML += "<br>Unable to retrieve your location...";
    console.log("Unable to retrieve your location...");

    //var pos = L.GeoIP.getPosition();

    status.innerHTML += "<br>Locating your IP...";

    var pos = geoFindByIp();



    var loc = {
      lat: parseFloat(pos.lat),
      lng: parseFloat(pos.lng)
    };

    setLoc(loc);

    //MicroModal.close('location-modal');

    return true;

    // alert("xxx"+pos);
    //
    // if(setLoc(pos)){
    //
    //   if(getLoc()){
    //
    //
    //       status.innerHTML += "<br>Found you...";
    //       console.log("Found you... b");
    //
    //
    //       MicroModal.close('location-modal');
    //
    //       return true;
    //   }else{
    //     return false;
    //   }
    // };

    //return true;

  }

  function gsuccess() {
    alert(9000);
  }

  function showDetails(type, index) {
    //alert(siteData['niah'][index]);
    //console.log(type);


    switch (type) {
      case 'niah':

        var title = siteData[type][index].NAME;

        var details = `

  <img src="${siteData[type][index].IMAGE_LINK}" style="width:100%">

  <table>
  <tr>
      <td>
          Address:
      </td>
      <td>
          <b>${siteData[type][index].STREET1},<br> ${siteData[type][index].TOWN},<br> ${siteData[type][index].COUNTY}</b>
      </td>
  </tr>
  <tr>
      <td>
          Original Use:
      </td>
      <td>
          <b>${siteData[type][index].ORIGINAL_TYPE}</b>
      </td>
  </tr>
  <tr>
      <td>
          Date:
      </td>
      <td>
          <b>${siteData[type][index].DATEFROM} - ${siteData[type][index].DATETO}</b>
      </td>
  </tr>
  <tr>
      <td>
          Composition:
      </td>
      <td>
          <b>${siteData[type][index].COMPOSITION}</b>
      </td>
  </tr>
  <tr>
      <td>
          Distance:
      </td>
      <td>
          <b>${Number(siteData[type][index].distance).toFixed(2)}km</b>
      </td>
  </tr>
  <tr>
      <td>
          Link:
      </td>
      <td>
          <b><a href="${siteData[type][index].WEBSITE_LINK}" target="_blank">Link<a></b>
      </td>
  </tr>


  </table>

  `;

        break;

      case ('smr'):

        //check if webnotes have been loaded for site
        if (!siteData[type][index].WEBNOTES) {

          // fetch notes for site
          $.getJSON("https://webservices.archaeology.ie/arcgis/rest/services/NM/NationalMonuments/MapServer/0/query?f=json&where=SMRS%20LIKE%20%27" + siteData[type][index].SMRS + "%27&outFields=WEBNOTES&returnGeometry=false", function(data) {

            siteData[type][index].WEBNOTES = data.features[0]['attributes']['WEBNOTES'];

            document.getElementById("webnotes").innerHTML = siteData[type][index].WEBNOTES;
          });

        }

        var title = siteData[type][index].CLASSDESC;

        var details = `

    <table>

    <img src="https://maps.googleapis.com/maps/api/staticmap?center=${siteData[type][index].lat},${siteData[type][index].lng}&zoom=18&size=400x300&&maptype=satellite&markers=color:red|anchor:center|${siteData[type][index].lat},${siteData[type][index].lng}&key=${gkey}"/>

    <tr>
        <td>
            Class Description:
        </td>
        <td>
            <b>${siteData[type][index].CLASSDESC}</b>
        </td>
    </tr>
    <tr>
        <td>
            Townland:
        </td>
        <td>
            <b>${siteData[type][index].TLAND_NAMES}</b>
        </td>
    </tr>

    <tr>
        <td>
            Notes:
        </td>
        <td>
            <b id="webnotes">${siteData[type][index].WEBNOTES}</b>
        </td>
    </tr>

    <tr>
        <td>
            Distance:
        </td>
        <td>
            <b>${Number(siteData[type][index].distance).toFixed(2)}km</b>
        </td>
    </tr>

    <tr>
        <td>
            Link:
        </td>
        <td>
            <b><a href="${siteData[type][index].Link}" target="_blank">Link<a></b>
        </td>
    </tr>
    </table>

    `;

        break;

      case ('wreck'):

        var title = siteData[type][index].name;

        var details = `

    <table>

    <tr>
        <td>
            Name:
        </td>
        <td>
            <b>${siteData[type][index].name}</b>
        </td>
    </tr>
    <tr>
        <td>
            Classification:
        </td>
        <td>
            <b>${siteData[type][index].Classification}</b>
        </td>
    </tr>

    <tr>
        <td>
            Place of Loss:
        </td>
        <td>
            <b>${siteData[type][index].Place_of_Loss}</b>
        </td>
    </tr>

    <tr>
        <td>
            Date of Loss:
        </td>
        <td>
            <b>${siteData[type][index].Date_of_Loss}</b>
        </td>
    </tr>

    <tr>
        <td>
            Description:
        </td>
        <td>
            <b>${siteData[type][index].Description}</b>
        </td>
    </tr>
    <tr>
        <td>
            Distance:
        </td>
        <td>
            <b>${Number(siteData[type][index].distance).toFixed(2)}km</b>
        </td>
    </tr>


    </table>

    `;

        break;
      default:

    }

    $('#title').html(title);

    $('#details').html(details);

    sidebar.open('profile');
  }

  function geoFindByIp(){

    var url = "https://geolocation-db.com/json/"+gdbkey;

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
  }



  function geoFindByIpx() {

    console.log("doing geo find by IP...");

    var url = "https://freegeoip.net/json/";

    var url = "http://ip-api.com/json/";
    var result = L.latLng(0, 0);

    // if (ip !== undefined) {
    //   url = url + ip;
    // } else {
    //   //lookup our own ip address
    // }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        var geoip_response = JSON.parse(xhr.responseText);
        result.lat = geoip_response.lat;
        result.lng = geoip_response.lon;
      } else {
        console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + xhr.status);
      }
    };
    xhr.send();
    return result;
  }


  function setLoc(latLng, set_url = false) {

    loc = latLng;

    if (set_url) {
      history.pushState(null, null, '/?lat=' + latLng.lat + '&lng=' + latLng.lng);
    }

    return loc;

  }

  function initLoc() {
    console.log("init loc");


    var url = new URL(document.URL);

    // if lat && loc params are set
    if (url.searchParams.has('lat') && url.searchParams.has('lng')) {
      console.log("latLng set in url !")

      //fix this

      var lat = parseFloat(url.searchParams.get('lat'));
      var lng = parseFloat(url.searchParams.get('lng'));

      var loc = {
        lat: parseFloat(url.searchParams.get('lat')),
        lng: parseFloat(url.searchParams.get('lng'))
      };


      setLoc(loc);
      initMap();

      return true;

    } else {
      console.log("loc not set");

      //set modal event  handlers
      $("#geoFind").click(function() {
        //alert("Handler for .click() called.");
        //return geoFind();
        geoFind();
      });

      // show geo modal
      MicroModal.show('location-modal');


    }

    //return loc;
  }

  return {
    initMap: initMap,
    getLoc: getLoc,
    setLoc: setLoc,
    initLoc: initLoc,
  }
})();



$(document).ready(function() {

  MicroModal.init();

  app.initLoc();

  // move
  $("#tw_share").click(function() {
    window.open("https://twitter.com/share?url="+ encodeURIComponent(window.location.href)+"&text=Check out my Isolation Island map %23COVID19Ireland %232kmfromhome&related=tweetphelan", '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;
  });


});
