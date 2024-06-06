function getWeekdays(calendar) {
    const weekdayMap = {
        "monday": "Mon",
        "tuesday": "Tue",
        "wednesday": "Wed",
        "thursday": "Thu",
        "friday": "Fri",
        "saturday": "Sat",
        "sunday": "Sun"
    };
    let runningWeekDays = [];
    for (const weekdayAttribute in weekdayMap) {
        if (calendar[weekdayAttribute]) {
            runningWeekDays.push(weekdayMap[weekdayAttribute]);
        }
    }
    return runningWeekDays.join(",");
}

document.addEventListener("DOMContentLoaded", ()=>{
    const feedId = findGetParameter("feed_id");
    const tripId = findGetParameter("trip_id");
    fetch(`/api/data/trips/${feedId}/${tripId}`).then(
        (response) => {
            return response.json();
        }
    ).then(
        (response) => {
            let trip = response.content;
            setValueAtId("trip-feed", trip.feed.display_name);
            setValueAtId("trip-id", trip.trip_id);
            setValueAtId("trip-route-id", formatTripLink(trip), true);
            setValueAtId("trip-short-name", trip.short_name);
            setValueAtId("trip-headsign", trip.headsign);
            setValueAtId("trip-first-stoptime", formatStopTime(trip.stop_times[0], false), true);
            setValueAtId("trip-last-stoptime", formatStopTime(trip.stop_times[trip.stop_times.length-1], true), true);
            setValueAtId("trip-service-start", getDate(trip.calendar.start_date));
            setValueAtId("trip-service-end", getDate(trip.calendar.end_date));
            setValueAtId("trip-service-weekdays", getWeekdays(trip.calendar));

            setTitle("Trip: ", `${trip.stop_times[0].stop.stop_name} - ${trip.stop_times[trip.stop_times.length-1].stop.stop_name}`);

            let calendarDateString = "";
            for (const calendarDate of trip.calendar_dates) {
                calendarDateString += `
                <tr>
                    <th>${getDate(calendarDate.date)}</th>
                    <th>${calendarDate.exception_type===1?"ADDED":"REMOVED"}</th>
                </tr>`;
            }
            setValueAtId("service-exceptions", calendarDateString, true);

            let stopTimeString ="";
            for (const stopTime of trip.stop_times) {
                stopTimeString += `
                <tr>
                    <td>${formatStop(stopTime.stop)}</td>
                    <td>${getTime(stopTime.arrival_time)}</td>
                    <td>${getTime(stopTime.departure_time)}</td>
                </tr>`
            }
            setValueAtId("trip-stoptimes", stopTimeString, true);
        }
    )
});

function formatTripLink(trip) {
    return `<a href="/routes.html?feed_id=${trip.feed_id}&route_id=${trip.route.route_id}">${trip.route.route_id}</a>`; 
}