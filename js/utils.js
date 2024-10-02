function formatStop(stop) {
    if (stop === null) {
        return "";
    }
    return `<a href="/stops.html?feed_id=${stop.feed_id}&stop_id=${stop.stop_id}">${stop.stop_name}</a>`;
}

function pretendUtc(timeString) {
    // YYYY-MM-DDThh:mm:ss+ffff
    timeString = timeString.slice(0, 19) + "Z"
    return new Date(timeString);
}

function formatStopTime(stopTime, preferArrival=false) {
    let time;
    if (stopTime.arrival_time === "") {
        time = stopTime.departure_time;
    } else if (stopTime.departure_time === "") {
        time = stopTime.arrival_time;
    } else {
        time = preferArrival ? stopTime.arrival_time : stopTime.departure_time;
    }
    let timeStr = pretendUtc(time).toISOString().slice(11, 16) //hh:mm
    return `${formatStop(stopTime.stop)} (${timeStr})`
}

function setValueAtId(id, value, setInnerHTML=false) 
{
    const e = document.getElementById(id);
    if (setInnerHTML) {
        e.innerHTML = value;
    } else {
        e.innerText = value;
    }
}

// shamelessly stolen from https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function getDate(dateString) {
    console.log("getdate", dateString)
    return pretendUtc(dateString).toISOString().slice(0, 10);
}

function getTime(dateString) {
    console.log("gettime", dateString)
    if (dateString === undefined) {
        return "";
    }
    return pretendUtc(dateString).toISOString().slice(11, 19);
}

function getRouteColorCss(route) {
    if (route.color === "") {
        return "";
    }
    return `color:#${route.text_color};background-color:#${route.color}`;
}

function nullableBoolToEmoji(nullableBool) {
    if (nullableBool == null) {
        return "❓"
    }
    return nullableBool ? "✔️" : "❌";
}

function setTitle(pageType, title) {
    document.title = `${pageType} ${title} - Traingazer`
}