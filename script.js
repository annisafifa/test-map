async function getGeo() {
    target.innerHTML = `<h1 style="padding-top:${screen.height/2.5}px; text-align:center;">Please Wait...</h1>`
    var geo = await fetch('./countries.geojson',{cache: 'force-cache'}).then(res=>res.json())
    var features = geo.features
    window.geofeatures=features
    target.removeChild(target.childNodes[0])
}

var styles = {
    // wigh: '#333333',
    "opacity": 0.5,
    "color": '#e4f'
}




 
 
 
 
 
 
 
 
 // Create a map object and specify the DOM element for display.
               var target = document.querySelector("#map")
               

               if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showMap);
                } else {
                    target.innerHTML = `<h1 style="padding-top:${screen.height/2.5}px; text-align:center;">No Geolocation Support</h1>`
                    }

                    function showMap(position) {
                    var x = [position.coords.latitude, position.coords.longitude];
                    var accuracy = position.coords.accuracy
                    initMap(x, accuracy)
                    }

                async function getLocName(e) {
                    
                    return await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}&localityLanguage=id`)
                        .then(response => response.json())
                        .then(data => {return data});
                    
                }

                function getDistance(x , y) {
                    let lat1 = x.lat
                    let lon1 = x.lng
                    let lat2 = y.lat
                    let lon2 = y.lng
                    let R = 6371e3; // metres
                    let φ1 = lat1 * Math.PI/180; // φ, λ in radians
                    let φ2 = lat2 * Math.PI/180;
                    let Δφ = (lat2-lat1) * Math.PI/180;
                    let Δλ = (lon2-lon1) * Math.PI/180;

                    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ/2) * Math.sin(Δλ/2);
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                    let d = R * c;
                    return `${Math.round(d/1000)} KM From Your Location`
                }

                async function setMark(e) {
                    let loc = await getLocName(e)
                    var l = loc.display_name
                    l+=`<br>${getDistance(e.latlng, window.currentLoc)}`
                    let code = loc.address.country_code
                    code = code.toUpperCase()
                    let detail = window.geofeatures.filter(f=>f.properties.ISO_A2==code)
                    return [L.marker(e.latlng, {title: l }).bindPopup(`<b>${l}</b>`), detail, code]
                }

               async function initMap(loc,acc){
               await getGeo()
               var map = L.map(target, {
                    center: loc,
                    zoom: 9, 
                    retina: true,
                    minZoom: 2,
                    maxZoom: 14
                });



                var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                });
                var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                }).addTo(map)

                var baseMap = {
                    "Street Map": Esri_WorldStreetMap,
                    "World Image": Esri_WorldImagery
                }

                L.control.layers(baseMap).addTo(map)

                var myLayer = L.geoJSON().addTo(map);

                if(sessionStorage.getItem('current_country')!=undefined){
                map.removeLayer(myLayer)
                myLayer.setStyle(styles)
                myLayer = L.geoJSON(window.geofeatures.filter(f=>f.properties.ISO_A2==sessionStorage.getItem('current_country')), {style: styles}).addTo(map)
                }

                async function addMarker(e) {
                    let x = await setMark(e, currentLoc)
                    let y = x[1]
                    let z = x[2]
                    x = x[0]
                    

                    x.addTo(map).on('contextmenu', function(e){map.removeLayer(this); map.flyTo(currentLoc._latlng, 10);})
                    x.addTo(map).on('click', function(e){map.flyTo(e.latlng); this.openPopup();})
                    map.flyTo(e.latlng, 9)
                    if(sessionStorage.getItem('current_country')!=z){
                        map.removeLayer(myLayer)
                        myLayer =  L.geoJSON(y, {style: styles}).addTo(map);
                        sessionStorage.setItem('current_country', z)
                        }
                    return x.openPopup()
                }

                var currentLoc = L.circle(loc, {color:'#0022ff', fillColor:'#00ccff', fillOpacity:1, radius:28000/map.getZoom()}).bindPopup("<b>You Are Here</b>")

                var approx = L.circle(loc,{color:'red', fillColor:'#0099ff', fillOpacity:0.2, radius:acc}).addTo(map)
                window.currentLoc = currentLoc._latlng
                currentLoc.on('click', function(e){map.flyTo(e.latlng); this.openPopup()})
                currentLoc.addTo(map);


                map.on('click', addMarker)
                map.on('zoom', function(e){
                    currentLoc.setRadius(28000/map.getZoom())
                })

               }

               
     