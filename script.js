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

                async function setMark(e) {
                    let loc = await getLocName(e)
                    var l = loc.display_name
                    console.log(loc)
                    return L.marker(e.latlng, {title: l }).bindPopup(`<b>${l}</b>`)
                }

               function initMap(loc,acc){
               var map = L.map(target, {
                    center: loc,
                    zoom: 14, 
                    retina: true
                });

                async function addMarker(e) {
                    let x = await setMark(e)
                    x.addTo(map).on('contextmenu', function(e){map.removeLayer(this); map.flyTo(currentLoc._latlng, 14);})
                    x.addTo(map).on('click', function(e){map.flyTo(e.latlng); this.openPopup();})
                    map.flyTo(e.latlng, 15)
                    return x.openPopup()
                }

                var currentLoc = L.circle(loc, {color:'#0022ff', fillColor:'#00ccff', fillOpacity:1, radius:100}).bindPopup("<b>You Are Here</b>")

                var approx = L.circle(loc,{color:'red', fillColor:'#0099ff', fillOpacity:0.2, radius:acc}).addTo(map)

                currentLoc.on('click', function(e){map.flyTo(e.latlng); this.openPopup()})
                currentLoc.addTo(map);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                }).addTo(map);

                map.on('click', addMarker)

               }

               
     