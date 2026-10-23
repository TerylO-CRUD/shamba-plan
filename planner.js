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
// weather and farming advice
function showWeather(weather, forecast) {
  let rainSoon = false;

  // Check for rain in the next 24 hours
  for (let i = 0; i < 8 && i < forecast.list.length; i++) {
    if (forecast.list[i].weather[0].main === "Rain") {
      rainSoon = true;
    }
  }

  let advice = "Good conditions for field work.";

  if (rainSoon) {
    advice = "Rain is expected. Consider delaying spraying and fertiliser.";
  } else if (weather.main.temp >= 30) {
    advice = "It is hot. Consider working early or late in the day.";
  }

  // Get one forecast for 5 days
  const days = [];
  const offset = forecast.city.timezone;

  for (let i = 0; i < forecast.list.length; i++) {
    const item = forecast.list[i];
    const hour = new Date(
      (item.dt + offset) * 1000
    ).getUTCHours();

    if (hour >= 11 && hour <= 13) {
      days.push(item);
    }
  }

  let forecastHtml = "";

  for (let i = 0; i < days.length; i++) {
    forecastHtml += `
      <div class="col-6 col-md">
        <div class="day-card">
          <strong>${days[i].dt_txt.slice(5, 10)}</strong>
          <br>
          ${Math.round(days[i].main.temp)}°C
          <br>
          <small>${days[i].weather[0].description}</small>
        </div>
      </div>`;
  }

  weatherResult.innerHTML = `
    <div class="card card-body mb-3">
      <h2 class="h4">${weather.name}</h2>
      <div class="temperature">${Math.round(weather.main.temp)}°C</div>
      <p class="mb-0">
        ${weather.weather[0].description}
        · Humidity ${weather.main.humidity}%
        · Wind ${Math.round(weather.wind.speed * 3.6)} km/h
      </p>
    </div>

    <div class="alert alert-info">${advice}</div>
    <h2 class="h5">Next 5 days</h2>
    <div class="row g-2">${forecastHtml}</div>`
  ;

  addNoteBtn.hidden = false;
}
// Load farm notes
    async function loadNotes() 
    {
    notesList.innerHTML = "<li class='list-group-item'>Loading notes...</li>";

      try 
      {
        const response = await fetch(NOTES_URL);

      if (!response.ok) 
      {
      throw new Error("Could not load farm notes.");
      }

        const notes = await response.json();

    notes.sort(function(a, b) 
    {
      return new Date(b.date) - new Date(a.date);
    });

    notesList.innerHTML = "";

      if (notes.length === 0) 
      {
      notesList.innerHTML =
        "<li class='list-group-item'>No notes yet. Add your first note.</li>";
      return;
      }

      for (let i = 0; i < notes.length; i++) 
      {
      const note = notes[i];

          const item = document.createElement("li");
            item.className = "list-group-item";

         const title = document.createElement("strong");
        title.textContent = note.crop + " · " + note.activity + " (" + note.town + ")";

        const comment = document.createElement("p");
          comment.textContent = note.comment;

        const details = document.createElement("small");
         details.className = "text-muted";
           details.textContent = new Date(note.date).toLocaleString();

      if (note.temp !== null && note.temp !== undefined) 
      {
        details.textContent += " · " + note.temp + "°C, " + note.condition;
      }

        item.appendChild(title);
        item.appendChild(comment);
        item.appendChild(details);
        notesList.appendChild(item);
      }
      } 
          catch (error) 
      {
            notesList.innerHTML = "";
             showMessage("Could not load notes. Check that JSON Server is running.", "danger");
  }
}

// Save a farm note
        async function saveNote(note) 
        {
           const response = await fetch(NOTES_URL, { method: "POST", headers: {"Content-Type": "application/json"
        },
            body: JSON.stringify(note)
  });

    if (!response.ok) 
    {
    throw new Error("Could not save your note.");
    }
        }

// Open the farm log
      addNoteBtn.addEventListener("click", function() 
      {
    showPage("notes");

     if (currentWeather) 
      {
       document.getElementById("noteTown").value = currentWeather.town;
      }
      });

//new farm note
       document.getElementById("noteForm").addEventListener("submit", async function(event) 
    {
      event.preventDefault();

      const note = 
    {
      town: document.getElementById("noteTown").value.trim(), crop: document.getElementById("noteCrop").value.trim(),
    activity: document.getElementById("noteActivity").value, comment: document.getElementById("noteComment").value.trim(),
    date: new Date().toISOString(), temp: null, condition: null
    };

  if (note.town === "" || note.crop === "" || note.comment === "") 
    {
    showMessage("Please fill in the town, crop and note.", "warning");
    return;
    }

  if (currentWeather && currentWeather.town === note.town) 
    {
    note.temp = currentWeather.temp;
    note.condition = currentWeather.condition;
    }

  try{
    await saveNote(note);

      event.target.reset();
      document.getElementById("noteTown").value = note.town;
      showMessage("Note saved!", "success");
      loadNotes();

  } catch (error) {
    showMessage(error.message, "danger");
  }
});

// Load weather
getWeather(document.getElementById("townSelect").value);