const locationText = document.getElementById('location');
const countryText = document.getElementById('country');
const timeText = document.getElementById('time');
const weatherText = document.getElementById('weather_text');
const degreesText = document.getElementById('degrees_num');
const feelsLikeText = document.getElementById('feels_like');
const windText = document.getElementById('wind_text');
const windDir = document.getElementById('wind_icon')
const precipitationIcon = document.getElementById('precip_icon');
const precipitationText = document.getElementById('precip_text');

const mainImageContainer = document.getElementById('weather_icon_container');
const hour1ImageContainer = document.getElementById('1hour_img_container');
const hour2ImageContainer = document.getElementById('2hour_img_container');
const hour3ImageContainer = document.getElementById('3hour_img_container');
const hour4ImageContainer = document.getElementById('4hour_img_container');

const hour1_timeText = document.getElementById('1hour_text');
const hour2_timeText = document.getElementById('2hour_text');
const hour3_timeText = document.getElementById('3hour_text');
const hour4_timeText = document.getElementById('4hour_text');
const hour1_tempText = document.getElementById('1hour_temp');
const hour2_tempText = document.getElementById('2hour_temp');
const hour3_tempText = document.getElementById('3hour_temp');
const hour4_tempText = document.getElementById('4hour_temp');
const hour1_windText = document.getElementById('1hour_wind');
const hour2_windText = document.getElementById('2hour_wind');
const hour3_windText = document.getElementById('3hour_wind');
const hour4_windText = document.getElementById('4hour_wind');
const hour1_precipText = document.getElementById('1hour_precip');
const hour2_precipText = document.getElementById('2hour_precip');
const hour3_precipText = document.getElementById('3hour_precip');
const hour4_precipText = document.getElementById('4hour_precip');

const conditionCodeToNorwegian = {
    1000: "D e klårt",
    1003: "D e delvis overskya",
    1006: "D e skya",
    1009: "D e overskya",
    1030: "D e litt tåka",
    1063: "D kan regne pittelitt",
    1066: "D kan snye pittelitt",
    1069: "D e litt sklætta kanskje",
    1072: "D e sånn iskald yr",
    1087: "D kan tordne!",
    1114: "Snyen blæs",
    1117: "Snystorm wee",
    1135: "D e tåkat",
    1147: "D e kald tåka",
    1150: "D e litt småyr",
    1153: "D yre",
    1168: "D e iskald yr",
    1171: "D e iskaldt pessregn",
    1180: "D e litt regn bære",
    1183: "D e lett regn bære",
    1186: "D regne av og tel",
    1189: "D regne greit",
    1192: "D e masse regn innimellom",
    1195: "D pessregne",
    1198: "D e lett iskald regn",
    1201: "D e iskald pessregn",
    1204: "D e lættsklætta",
    1207: "D e masse sklætta",
    1210: "D e litt sny bære",
    1213: "D snye litt",
    1216: "D snye greit innimellom",
    1219: "D snye greit",
    1222: "D e masse sny innimellom",
    1225: "D snye som faen",
    1237: "D e faen mæ is i lufta",
    1240: "D e sånne små regndusja",
    1243: "D e sånne regndusja",
    1246: "D e satans med regn",
    1249: "D e sklættdusja(?)",
    1252: "D e masse sklætta",
    1255: "D snye litt innimellom",
    1258: "D snye masse innimellom",
    1261: "D e IS som kjæm innimellom",
    1264: "D e masse fuckings is",
    1273: "D e litt regn og TORDEN!",
    1276: "D e MASSE regn og fuckings TORDEN!",
    1279: "D e litt sny, men TORDEN!!",
    1282: "D snye masse og det tordne wtf"
}

document.getElementById('search').addEventListener('click', function() {
    const location = document.getElementById('location').value;
    if (location) {
        fetchWeatherData(location);
    } else {
        alert("Please enter a location.");
    }
});

function getNorwegianWeatherDescription(code) {
    return conditionCodeToNorwegian[code] || "Øh, æ e litt usekker";
}

function getNextFourHoursForecast(forecastData, currentHour) {
    const today = forecastData.forecast.forecastday[0].hour;
    const tomorrow = forecastData.forecast.forecastday[1].hour;

    let nextFourHours = [];

    if (currentHour > 20) {
        const hoursToday = today.slice(currentHour);
        const hoursTomorrow = tomorrow.slice(0, 4 - hoursToday.length);
        nextFourHours = hoursToday.concat(hoursTomorrow);
    } else {
        nextFourHours = today.slice(currentHour, currentHour + 4);
    }

    return nextFourHours;
}

function determinePrecipitationType(conditionCode, temperature) {
    const snowCodes = [1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282];
    const rainCodes = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246];

    if (snowCodes.includes(conditionCode)) {
        return 'snow';
    } else if (rainCodes.includes(conditionCode)) {
        return 'rain';
    } else if (temperature <= 0) {
        return 'snow';
    } else {
        return 'rain';
    }
}

function adjustInputWidth(inputFieldId, hiddenTextId) {
    const input = document.getElementById(inputFieldId);
    const text = input.value;

    const hiddenText = document.getElementById(hiddenTextId);
    hiddenText.textContent = text;

    // Copy font styles to match the input field
    hiddenText.style.fontSize = window.getComputedStyle(input).fontSize;
    hiddenText.style.fontFamily = window.getComputedStyle(input).fontFamily;

    // Show the hidden span to measure its width
    hiddenText.style.display = 'inline';
    const width = hiddenText.offsetWidth;
    hiddenText.style.display = 'none';

    // Update the width of the input field
    input.style.width = (width + 20) + 'px'; // +20 for some padding
}

// Event listener for input changes
document.getElementById('location').addEventListener('input', function() {
    adjustInputWidth('location', 'hiddenText');
});


async function fetchWeatherData(location) {
    const apiKey = '249a37ba0c7a48798b7185549231012';
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=2`;

    const currentHour = new Date().getHours();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        
        // Extract current data
        const currentLocation = data.location.name;
        const currentCountry = data.location.country;
        const condition = data.current.condition.text;
        const temperatureC = data.current.temp_c;
        const feelsLikeC = data.current.feelslike_c;
        const precipitation = data.current.precip_mm;
        const windSpeed = Math.round(data.current.wind_kph * 0.28);
        const windGust = Math.round(data.current.gust_kph * 0.28);
        const windDirection = data.current.wind_degree;
        const localTime = data.location.localtime.split(' ')[1];
        const isDay = data.current.is_day;
        const conditionCode = data.current.condition.code;

        const precipType = determinePrecipitationType(conditionCode, temperatureC);

        // Add current data to DOM
        locationText.value = currentLocation === "Bleik" ? "Bleik ❤️" : currentLocation;
        adjustInputWidth('location', 'hiddenText');
        countryText.textContent = currentCountry === "Norway" ? "" : currentCountry;
        timeText.textContent = localTime;
        degreesText.textContent = temperatureC;
        feelsLikeText.textContent = `Føles som ${feelsLikeC}°`;
        windText.textContent = `${windSpeed} m/s (${windGust})`;
        precipitationText.textContent = `${precipitation} mm`;

        if (precipType == 'rain'){
            precipitationIcon.textContent = '💧';
        } else if (precipType == 'snow'){
            precipitationIcon.textContent = '❄️';
        }

        if (windSpeed > 0){
            windDir.style.transform = 'rotate(' + (windDirection + 180) + 'deg)';
        } else if (windSpeed <= 0) {
            windDir.style.display = 'none';
        }

        // Get the next four hours forecast
        const nextFourHoursForecast = getNextFourHoursForecast(data, currentHour + 1);

        // Update DOM elements for the next four hours
        [nextFourHoursForecast[0], nextFourHoursForecast[1], nextFourHoursForecast[2], nextFourHoursForecast[3]].forEach((hourForecast, index) => {
        const hourTime = hourForecast.time.split(' ')[1];
        const hourTemp = hourForecast.temp_c;
        const hourWind = Math.round(hourForecast.wind_kph * 0.28);
        const hourGust = Math.round(hourForecast.gust_kph * 0.28);
        const hourPrecip = hourForecast.precip_mm;
        const hourCondition = hourForecast.condition.code;
        const hourPrecipType = determinePrecipitationType(hourCondition, hourTemp);
        const hourIsDay = hourForecast.is_day;

        document.getElementById(`${index+1}hour_text`).textContent = hourTime;
        document.getElementById(`${index+1}hour_temp`).textContent = `${hourTemp}°C`;
        document.getElementById(`${index+1}hour_wind`).textContent = `${hourWind} m/s (${hourGust})`;
        
        if (hourPrecipType == "rain"){
            document.getElementById(`${index+1}hour_precip`).textContent = `💧 ${hourPrecip}`;
        } else if (hourPrecipType == "snow"){
            document.getElementById(`${index+1}hour_precip`).textContent = `❄️ ${hourPrecip}`;
        }
        
        

        const dayOrNight = hourIsDay === 1 ? 'day' : 'night';
        const hourImageName = `${hourCondition}-${dayOrNight}.png`;
        const hourImagePath = `img/weather_icons/${hourImageName}`;
        document.getElementById(`${index+1}hour_img_container`).innerHTML = `<img src="${hourImagePath}" alt="Weather Image" class="forecast_img">`;
        });


        // Image file handling
        const dayOrNight = isDay === 1 ? 'day' : 'night';
        const imageName = `${conditionCode}-${dayOrNight}.png`;
        const imagePath = `img/weather_icons/${imageName}`;

        mainImageContainer.innerHTML = `<img src="${imagePath}" alt="Weather Image" id="weather_icon">`;

        // Condition text
        const descriptionInNorwegian = getNorwegianWeatherDescription(conditionCode);
        weatherText.textContent = descriptionInNorwegian;

        // LOG
        console.log(data);
    } catch (error) {
        console.error('Error fetching weather data: ', error);
    }


}

document.getElementById('location').addEventListener('input', function() {
    adjustInputWidth('location', 'hiddenText');
});

fetchWeatherData('Tromsdalen');
