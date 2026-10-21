export async function getWeather() {
    const latitude = 35.6895;
    const longitude = 139.6917;

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,weather_code` +
        `&timezone=Asia%2FTokyo`;

    const response = await fetch(url);
    const data = await response.json();

    const temperature = data.current.temperature_2m;
    const weatherCode = data.current.weather_code;

    const weatherText = getWeatherText(weatherCode);

    document.getElementById("weather").textContent =
        `${temperature}℃ ${weatherText}`;
}

function getWeatherText(code) {
    switch (code) {
        default:
          return "Undefined";
        case 0:
            return "clear sky";
        case 1:
            return "Mainly clear";
        case 2:
            return "Partly cloudy";
        case 3:
            return "Overcast";
        case 45:
            return "Fog";
        case 48:
            return "Depositing rime fog";
        case 51:
            return "Light drizzle";
        case 53:
            return "Moderate drizzle";
        case 55:
            return "Dense drizzle";
        case 56:
            return "Light freezing drizzle";
        case 57:
            return "Dense freezing drizzle";
        case 61:
            return "Slight rain";
        case 63:
            return "Moderate rain";
        case 65:
            return "Heavy rain";
        case 66:
            return "Light freezing rain";
        case 67:
            return "Heavy freezing rain";
        case 71:
            return "Slight snowfall";
        case 73:
            return "Moderate snowfall";
        case 75:
            return "Heavy snowfall";
        case 77:
            return "Snow grains";
        case 80:
            return "Slight rain showers";
        case 81:
            return "Moderate rain showers";
        case 82:
            return "Violent rain showers";
        case 85:
            return "Slight snow showers";
        case 86:
            return "Heavy snow showers";
        case 95:
            return "Thunderstorm";
        case 96:
            return  "Thunderstorm with slight hail";
        case 97:
            return  "Heavy thunderstorm";
        case 99:
            return "Thunderstorm with heavy hail";
    }
}
