function formatStop(stop) {
    if (stop === null) {
        return "";
    }
    return `<a href="/stops.html?feed_id=${stop.feed_id}&stop_id=${stop.stop_id}">${stop.stop_name}</a>`;
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
    time = new Date(time);
    let timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}`;
    return `${formatStop(stopTime.stop)} (${timeStr})`
}

function pad(num) {
    return num<10? "0"+num : num;
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
    let d = new Date(dateString);
    return `${pad(d.getFullYear())}-${pad(d.getMonth())}-${pad(d.getDay())}`;
}

function getTime(dateString) {
    if (dateString === undefined) {
        return "";
    }
    let d = new Date(dateString) 
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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