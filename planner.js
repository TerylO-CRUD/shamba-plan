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
