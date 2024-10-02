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

function formatStatus(pt) {
    const stopTimes = pt.sight.trip.stop_times;
    if (pt.timestamp < stopTimes[0].departure_time) {
        return "About to start";
    }
    let prevStopTime;
    for (const stopTime of stopTimes) {
        if (pt.timestamp < stopTime.arrival_time) {
            //on its way prevStopTime and stopTime
            return `Between ${formatStopTime(prevStopTime, false)} and ${formatStopTime(stopTime, true)}`;
        }
        if (pt.timestamp < stopTime.departure_time) {
            return `Stopped at ${formatStopTime(stopTime, true)}`
        }
        prevStopTime = stopTime;
    }
    return "Just arrived";
}

function displayPage(pageNumber) {
    document.getElementById("entries").innerHTML = "";
    let lines = "";
    // for (const pt of window.sights.slice(PAGE_LENGTH*pageNumber, PAGE_LENGTH*(pageNumber+1))) {
    for (const event of window.journeyEvents.slice(PAGE_LENGTH.pageNumber, PAGE_LENGTH*(pageNumber+1))) {
        let line;
        let lateSeconds = parseInt(document.getElementById("late-seconds").value)
        if (isNaN(lateSeconds)) {
            lateSeconds = 0
        }
        if (event.isSight) {
            const pt = event.content;
            line = `<tr>
                <td>${getDate(pt.timestamp)}</td>
                <td>${getTime(pt.timestamp)}</td>
                <td><a href="/trips.html?feed_id=${pt.sight.feed_id}&trip_id=${pt.sight.trip.trip_id}">${pt.sight.feed.display_name}</a></td>
                <td>${formatRouteType(pt.sight.trip.route.type)}</td>
                <td style="${getRouteColorCss(pt.sight.trip.route)}">${pt.sight.route_name}</td>
                <td>${formatStopTime(pt.sight.first_st, false)}</td>
                <td>${formatStopTime(pt.sight.last_st, true)}</td>
                <td>${Math.floor(pt.sight.distance_km*1000)} m</td>
                <td>${formatStatus(pt)}</td>
            </tr>`;
        } else {
            var timestamp = event.isArrival ? event.content.arrival_time : event.content.departure_time;//NOTE: only contains time part, date is unix epoch
            timestamp = pretendUtc(timestamp)
            timestamp = new Date(timestamp.getTime() + 1000 * lateSeconds)
            line = `<tr>
                <td></td>
                <td>${getTime(timestamp.toISOString())}</td>
                <td colspan="7">${event.isArrival?"Arrival in":"Departure from"} ${formatStop(event.content.stop)}</td>
            </tr>`
        }
        lines += line
    }
    setValueAtId("entries", lines, true);
}

function sightsApiCall() {
    document.getElementById("spinner").classList.remove("hidden");
    let date = document.getElementById("date").value;
    if (date === "") {
        date = getDate(new Date().toISOString());
    }
    let lateSeconds = document.getElementById("late-seconds").value;
    fetch(`/api/aboard/${window.feedId}/${window.tripId}/${date}/${lateSeconds}`)
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
        window.journeyEvents = [];
        let stopTimeIndex = 1; //start at 1 bc we're between [0].departure and [1].arrival
        let sightIndex = 0; 
        let isStopTimeArrival = false;
        const stopTimes = jsonResponse.trip.stop_times;
        const sights = jsonResponse.sights;
        while (stopTimeIndex < stopTimes.length || sightIndex < sights.length) {
            let shouldHandleSight = (stopTimeIndex == stopTimes.length);
            if (!shouldHandleSight && sightIndex != sights.length) {
                let nextStopTimeTimestamp = isStopTimeArrival ? stopTimes[stopTimeIndex].arrival_time : stopTimes[stopTimeIndex-1].departure_time;
                nextStopTimeTimestamp = pretendUtc(nextStopTimeTimestamp);
                let nextSightTimestamp = new Date(pretendUtc(sights[sightIndex].timestamp).getTime() + 1000 * lateSeconds);
                shouldHandleSight = (nextSightTimestamp.toISOString().slice(11,19) < nextStopTimeTimestamp.toISOString().slice(11,19)); //compare the time parts
            }
            if (shouldHandleSight) {
                window.journeyEvents.push({isSight: true, content: sights[sightIndex++]})
            } else {
                window.journeyEvents.push({isSight: false, content: stopTimes[isStopTimeArrival?stopTimeIndex:(stopTimeIndex-1)], isArrival: isStopTimeArrival});
                if (isStopTimeArrival) {
                    stopTimeIndex++; //only increment if we switch from departure to next stoptime's arrival
                }
                isStopTimeArrival = !isStopTimeArrival; //don't forget to invert
            }
        }
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
