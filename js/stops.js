document.addEventListener("DOMContentLoaded", ()=>{
    const feedId = findGetParameter("feed_id");
    const stopId = findGetParameter("stop_id");
    fetch(`/api/data/stops/${feedId}/${stopId}`).then(
        (response) => {
            return response.json();
        }
    ).then(
        (response) => {
            let stop = response.content;
            setValueAtId("stop-feed", stop.feed.display_name);
            setValueAtId("stop-id", stop.stop_id);
            setValueAtId("stop-name", stop.stop_name);
            setValueAtId("stop-parent", formatStop(stop.parent_station), true);
            setValueAtId("stop-lat", stop.lat);
            setValueAtId("stop-lon", stop.lon);
            setValueAtId("observation-button", `<a class="btn btn-primary" href="/?lat=${stop.lat}&lon=${stop.lon}&auto_query=1&name=${stop.stop_name}">Observe!</a>`, true);

            setTitle("Station info: ", stop.stop_name);

            let childStopsHTML = "";
            for (const childStop of stop.child_stations) {
                childStopsHTML += `<tr>
                    <td>${formatStop(childStop)}</td>
                    <td>${childStop.lat}</td>
                    <td>${childStop.lon}</td>
                </tr>`
            }
            setValueAtId("stop-children", childStopsHTML, true);

            let stopTimesHTML = "";
            for (const stopTime of stop.stop_times) {
                stopTimesHTML += `
                <tr>
                <td><a href="/trips.html?feed_id=${stopTime.feed_id}&trip_id=${stopTime.trip_id}">${stopTime.trip_id}</a></td>
                <td>${getTime(stopTime.arrival_time)}</td>
                <td>${getTime(stopTime.departure_time)}</td>
                </tr>`;
            }
            setValueAtId("stop-stoptimes", stopTimesHTML, true);
        }
    )
});