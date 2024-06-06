document.addEventListener("DOMContentLoaded", ()=>{
    const feedId = findGetParameter("feed_id");
    const routeId = findGetParameter("route_id");
    fetch(`/api/data/routes/${feedId}/${routeId}`).then(
        (response) => {
            return response.json();
        }
    ).then(
        (response) => {
            let route = response.content;

            let tableContent = "";
            for (const trip of route.trips) {
                tableContent += `
                <tr>
                    <td><a href="/trips.html?feed_id=${feedId}&trip_id=${trip.trip_id}">${trip.trip_id}</a></td>
                    <td>${formatStopTime(trip.stop_times[0], false)}</td>
                    <td>${formatStopTime(trip.stop_times[trip.stop_times.length - 1], true)}</td>
                </tr>`;
            }
            document.getElementById("route-trips").innerHTML = tableContent;

            setValueAtId("route-feed", route.feed.display_name);
            setValueAtId("route-id", route.route_id);
            setValueAtId("route-short-name", route.short_name);
            document.getElementById("route-short-name").style = getRouteColorCss(route);
            setValueAtId("route-long-name", route.long_name);

            setTitle("Route: ", `${route.short_name} ${route.long_name}`);
        }
    )
});