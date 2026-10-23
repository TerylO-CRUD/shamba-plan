//SHAMBA WEATHER-PLANNER


const API_KEY = "4dc59bd80243ac8cc1f17d60a9fc824a";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/";
const NOTES_URL = "http://localhost:3000/notes";

// Get elements from HTML
const messageBox = document.getElementById("message");
const weatherSection = document.getElementById("weatherSection");
const notesSection = document.getElementById("notesSection");
const weatherResult = document.getElementById("weatherResult");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");

let currentWeather = null;

// Display messages
    function showMessage(message, type) 
    {
      messageBox.innerHTML = "";

      const alert = document.createElement("div");
      alert.className = "alert alert-" + type;
        alert.textContent = message;

    messageBox.appendChild(alert);
    }
// Switch between pages
      function showPage(page) 
      {
        weatherSection.hidden = page !== "weather";
        notesSection.hidden = page !== "notes";
        messageBox.innerHTML = "";

        if (page === "notes") {
        loadNotes();
        }
      }
// Show the farm notes page
  document.getElementById("showNotes").addEventListener("click", function() 
  {
  showPage("notes");
  });
// Show the weather page
  document.getElementById("showWeather").addEventListener("click", function() {
  showPage("weather");
  });
// OpenWeatherMap
     async function getWeather(town) 
      {
      messageBox.innerHTML = "";
        weatherResult.textContent = "Loading...";
         addNoteBtn.hidden = true;

    try {
        const url = WEATHER_URL + "weather?q=" + encodeURIComponent(town) + "&units=metric&appid=" + API_KEY;
        const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not find the town or get its weather.");
    }

    const weather = await response.json();

    const forecastResponse = await fetch(
      WEATHER_URL + "forecast?q=" + encodeURIComponent(town) + "&units=metric&appid=" + API_KEY
    );

    if (!forecastResponse.ok) {
      throw new Error("Could not get the forecast.");
    }

    const forecast = await forecastResponse.json();

    currentWeather = {
      town: weather.name,
      temp: Math.round(weather.main.temp),
      condition: weather.weather[0].description
    };

    showWeather(weather, forecast);

  } catch (error) {
    weatherResult.textContent = "";
    showMessage(error.message, "danger");
  }
}
// Get weather details when a town is selected
document.getElementById("townSelect").addEventListener("change", function(event) 
{
  getWeather(event.target.value);
});
// Search for a town
    document.getElementById("searchForm").addEventListener("submit", function(event) 
    {
    event.preventDefault();

    const town = document.getElementById("townInput").value.trim();

  if (town === "") 
    {
    showMessage("Please enter a town name.", "warning");
    return;
    }

  getWeather(town);
    });
