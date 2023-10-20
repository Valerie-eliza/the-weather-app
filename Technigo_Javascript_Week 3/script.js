const apiKey = '13bef5f3464e07d2b5e2fc9b2def4624';
const currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const forecastList = document.getElementById('forecastList');

fetchWeather("Stockholm");
fetchForecast("Stockholm");

function fetchWeather(location) {
    const url = `${currentWeatherUrl}?q=${location}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const description = data.weather[0].description;
            temperatureElement.textContent = `${Math.round(data.main.temp * 10) / 10}°C`;
            descriptionElement.textContent = description;

            // Process and display sunrise and sunset (showing only hours and minutes)
            const sunriseDate = new Date(data.sys.sunrise * 1000);
            const sunsetDate = new Date(data.sys.sunset * 1000);
            document.getElementById('sunrise').textContent = `Sunrise: ${sunriseDate.getHours()}:${sunriseDate.getMinutes().toString().padStart(2, '0')}`;
            document.getElementById('sunset').textContent = `Sunset: ${sunsetDate.getHours()}:${sunsetDate.getMinutes().toString().padStart(2, '0')}`;

            if (description.includes('cloud') || description.includes('rain')) {
                weatherIcon.src = 'cloud.png';
            } else {
                weatherIcon.src = 'sun.png';
            }
            weatherIcon.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function fetchForecast(location) {
    const url = `${forecastUrl}?q=${location}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            forecastList.innerHTML = '';
            const today = new Date().toDateString();

            // Object to store min and max temps for each day
            let dailyTemps = {};

            for (let forecast of data.list) {
                const date = new Date(forecast.dt * 1000);

                // Skip today's date in the forecast
                if (date.toDateString() === today) {
                    continue;
                }

                const dayDate = date.toLocaleString('en-US', { day: 'numeric', month: 'numeric' });

                if (!dailyTemps[dayDate]) {
                    dailyTemps[dayDate] = {
                        min: forecast.main.temp_min,
                        max: forecast.main.temp_max,
                        day: date.toLocaleString('en-US', { weekday: 'long' })
                    };
                } else {
                    dailyTemps[dayDate].min = Math.min(dailyTemps[dayDate].min, forecast.main.temp_min);
                    dailyTemps[dayDate].max = Math.max(dailyTemps[dayDate].max, forecast.main.temp_max);
                }
            }

            // Convert the object to an array and slice to get only the next 5 days
            const nextFiveDays = Object.values(dailyTemps).slice(0, 5);

            for (let day of nextFiveDays) {
                const maxTemp = Math.round(day.max * 10) / 10; // Rounding to 1 decimal place
                const minTemp = Math.round(day.min * 10) / 10; // Rounding to 1 decimal place

                const listItem = document.createElement('li');

                const dayElement = document.createElement('span');
                dayElement.className = 'forecast-day';
                dayElement.textContent = day.day;

                const tempElement = document.createElement('span');
                tempElement.className = 'forecast-temp';
                tempElement.textContent = `${maxTemp}°C / ${minTemp}°C`;

                listItem.appendChild(dayElement);
                listItem.appendChild(tempElement);
                forecastList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

