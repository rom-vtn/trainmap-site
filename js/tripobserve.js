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
    for (const pt of window.sights.slice(PAGE_LENGTH*pageNumber, PAGE_LENGTH*(pageNumber+1))) {
        const line = `<tr>
            <td>${getDate(pt.timestamp)}</td>
            <td>${getTime(pt.timestamp)}</td>
            <td><a href="/trips.html?feed_id=${pt.sight.feed_id}&trip_id=${pt.sight.trip.trip_id}">${pt.sight.feed.display_name}</a></td>
            <td>${formatRouteType(pt.sight.trip.route.type)}</td>
            <td style="${getRouteColorCss(pt.sight.trip.route)}">${pt.sight.route_name}</td>
            <td>${formatStopTime(pt.sight.first_st, false)}</td>
            <td>${formatStopTime(pt.sight.last_st, true)}</td>
            <td>${Math.floor(pt.sight.distance_km*1000)} m</td>
            <td>[TODO]</td>
        </tr>`
        lines += line
    }
    setValueAtId("entries", lines, true);
}

function sightsApiCall() {
    document.getElementById("spinner").classList.remove("hidden");
    fetch(`/api/aboard/${window.feedId}/${window.tripId}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonResponse) {
        if (!jsonResponse.success) {
            document.getElementById("spinner").classList.add("hidden");
            alert(`Upsie Wupsie the server just fucky wuckied UwU: \n ${jsonResponse.error}`);
            return
        }
        window.sights = jsonResponse.sights;
        displayPage(0);
        document.getElementById("spinner").classList.add("hidden");
    })
}

document.addEventListener("DOMContentLoaded", ()=>{
    window.feedId = findGetParameter("feed_id");
    window.tripId = findGetParameter("trip_id");

    console.log(window.feedId, window.tripId);

    document.getElementById("nextpage").addEventListener("click", nextPage)
    document.getElementById("prevpage").addEventListener("click", previousPage)

    window.currentPage = 0;
    sightsApiCall();
})
