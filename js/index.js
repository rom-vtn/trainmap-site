//default to SB bridge
// const defaultCoords = [49.233955084486965,6.961684226989747]
//SB Hbf
const defaultCoords = [49.24123299474095, 6.991338729858399]
//special KA GPN22 edition
// const defaultCoords = [48.992847, 8.401682];


//setup triggers
function onMapClick(e) {
    document.getElementById("current-location").innerText = [e.latlng.lat, e.latlng.lng].toString()
    window.currentMarker.setLatLng(e.latlng)
    
    //update URL
    //add auto query on load and discard current name
    window.history.replaceState({}, null, `?auto_query=1&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
}

const PAGE_LENGTH = 1000;

function nextPage() {
    window.currentPage++
    if (window.currentPage*PAGE_LENGTH > window.sights.length) {
        window.currentPage--
    }
    displayPage(window.currentPage);
}

function previousPage() {
    window.currentPage--
    if (window.currentPage < 0) {
        window.currentPage = 0
    }
    displayPage(window.currentPage);
}

function formatRouteType(routeType) {
    const map = ["🚋", "🚇", "🚆", "🚌"];
    let content = map[routeType];
    if (content === undefined) {
        return "❓";
    }
    return content;
}

function displayPage(pageNumber) {
    document.getElementById("entries").innerHTML = "";
    let lines = "";
    const sightSlice = window.sights.slice(PAGE_LENGTH*pageNumber, PAGE_LENGTH*(pageNumber+1))
    for (const inSliceIndex in sightSlice) {
        const realTrainSight = sightSlice[inSliceIndex]
        const line = `<div class="row py-2 border" id="sight-row-${(+PAGE_LENGTH)*(+pageNumber) + (+inSliceIndex)}">
            <div class="col-12 col-md-12 text-center" style="${getRouteColorCss(realTrainSight.sight.trip.route)};text-align:auto"><h2>${realTrainSight.sight.route_name} (→ ${realTrainSight.sight.last_st.stop.stop_name})</h2></div>
            <div class="col-6 col-md-3">📅 ${getDate(realTrainSight.timestamp)}</div>
            <div class="col-6 col-md-3">🕒 ${getTime(realTrainSight.timestamp)}</div>
            <div class="col-6 col-md-3">ℹ️ <a href="/trips.html?feed_id=${realTrainSight.sight.feed_id}&trip_id=${realTrainSight.sight.trip.trip_id}">${realTrainSight.sight.feed.display_name}</a></div>
            <div class="col-6 col-md-3">❓ ${formatRouteType(realTrainSight.sight.trip.route.type)}</div>
            <div class="col-6 col-md-3">🚀 ${formatStopTime(realTrainSight.sight.first_st, false)}</div>
            <div class="col-6 col-md-3">🏁 ${formatStopTime(realTrainSight.sight.last_st, true)}</div>
            <div class="col-6 col-md-3">👀 ${formatStopTime(realTrainSight.sight.st_before, false)}</div>
            <div class="col-6 col-md-3">👉 ${formatStopTime(realTrainSight.sight.st_after, true)}</div>
        </div>`

        lines += line
    }
    setValueAtId("entries", lines, true);
}

function sightsApiCall() {
    document.getElementById("spinner").classList.remove("hidden");
    
    let dateString = document.getElementById("date").value;

    fetch(`/api/sights/${window.currentMarker.getLatLng().lat}/${window.currentMarker.getLatLng().lng}/${dateString}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonResponse) {
        if (!jsonResponse.success) {
            document.getElementById("spinner").classList.add("hidden");
            alert(`Upsie Wupsie the server just fucky wuckied UwU: \n ${jsonResponse.error}`);
            return
        }
        window.sights = jsonResponse.passing_times;
        scrollToLatest();
        document.getElementById("spinner").classList.add("hidden");  
    })
}

function scrollToLatest() {
    let scrollRow = null;
    const thresholdMs = Date.parse(new Date().toISOString())
    for (i in window.sights) {
        const realSight = window.sights[i]
        const sightTimestampMs = Date.parse(realSight.timestamp);
        if (sightTimestampMs < thresholdMs) {
            continue
        }
        scrollRow = i
        break
    }
    if (scrollRow === null) {
        displayPage(0);
    } else {
        let pageNumber = Math.floor(i / PAGE_LENGTH)
        displayPage(pageNumber)
        scrolls(`#sight-row-${scrollRow}`, {
            offsetDistance: -100
        }); //uses scrolls.js
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    let coordArr;
    const title = findGetParameter("name");
    if (title) {
        setTitle("Watching", title)
    }
    const lat = parseFloat(findGetParameter("lat"));
    const lon = parseFloat(findGetParameter("lon"));
    if (isNaN(lat) || isNaN(lon)) {
        coordArr = defaultCoords;
    } else {
        coordArr = [lat, lon];
    }

    // setup map
    let map = L.map('map').setView(coordArr, 13);

    // use OSM 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // add clicke event
    map.on('click', onMapClick);


    window.currentMarker = L.marker(coordArr).addTo(map);

    document.getElementById("current-location").innerText = coordArr.toString()
    document.getElementById("query-traffic").addEventListener("click", sightsApiCall)
    document.getElementById("nextpage").addEventListener("click", nextPage)
    document.getElementById("prevpage").addEventListener("click", previousPage)

    window.currentPage = 0;

    const autoQuery = parseInt(findGetParameter("auto_query"));
    if (autoQuery) {
        sightsApiCall();
    }
})