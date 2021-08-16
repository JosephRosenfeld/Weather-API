const API_KEY = 'b2cbc3e59710481a972235556202412';
const form = document.querySelector('form');
const API_BASE_URL = 'http://api.weatherapi.com/v1';
const CUR_METHOD = '/current.json';
const FORECAST_METHOD = '/forecast.json';
const days = 7;
var url = API_BASE_URL + FORECAST_METHOD + "?q=";
const errorContainer = document.querySelector(".error-container");
const errorText = document.querySelector("#error-text");  
const curWeatherContainer = document.querySelector(".cur-weather-container");
const forecastContainer = document.querySelector(".forecast-container");
const forecastDays = document.querySelectorAll(".forecast-day");


form.addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const zip = formData.get('zip');
  
  fetch(url + zip + `&days=${days}`, {
    method: 'GET',
    headers: {
      'key': API_KEY,
    }
  }) 
    .then(response => { //Catch invalid fetch api promise resolve
      if (!response.ok) {
        throw "Network Error";
      } 
      return response;
    })
    .then(response => response.json()) //Convert text body into json object
    .then(forecastObj => {
      buildCurForecast(forecastObj);
      buildFutureForecast(forecastObj)
    })
    .catch(err => {
      console.log(err);
      curWeatherContainer.style.display = "none";
      forecastContainer.style.display = "none";
      errorContainer.style.display = "flex";
      errorText.innerHTML = "Invalid Zip Code";
      //Add in the shiz for if its a new zip code after ones already been typed in
    });
});

function buildCurForecast(res) {
  //show and hide sections
  curWeatherContainer.style.display = "flex";
  errorContainer.style.display = "none";
  //splice time variable into array and perform logic to convert to 12 hr time
  let curTime = res.location.localtime;
  let dateTimeReg = /(\d\d\d\d)-(\d\d)-(\d\d)\s(\d+):(\d\d)/;
  let dt = curTime.match(dateTimeReg);
  console.log(dt);
  let timePeriod;
  if (dt[4] > 12) {
    dt[4] = dt[4] - 12;
    timePeriod = "pm";
  } else {
    timePeriod = "am";
  }
  //Filling in elements
  document.querySelector(".cur-location").innerText = `${res.location.name}, ${res.location.region}`;
  document.querySelector(".cur-time").innerText = `as of ${dt[4]}:${dt[5]} ${timePeriod} on ${dt[3]}-${dt[2]}-${dt[1]}`;
  document.querySelector(".cur-temp").innerText = `${res.current.temp_f}°`;
  document.querySelector(".cur-icon").innerHTML = `<img src="https:${res.current.condition.icon}">`;
  document.querySelector(".cur-icon-description").innerText = res.current.condition.text;
}

function buildFutureForecast(futureForecast) {
  //show and hide sections
  forecastContainer.style.display = "flex";
  let dt = new Date();
  console.log(futureForecast.forecast.forecastday.length);
  for(i = 0; i < forecastDays.length; i++) {
    if (i >= futureForecast.forecast.forecastday.length) {
      let dateEl = forecastDays[i].children[0];
      let tempEl = forecastDays[i].children[1];
      dateEl.innerText = `${dt.getMonth() + 1}-${dt.getDate()}`;
      dt.setDate(dt.getDate() + 1); //increment date
      tempEl.innerText = `NA`;
      continue;
    }
    let forecastEl = futureForecast.forecast.forecastday[i];
    let containerEl = forecastDays[i];
    let dateEl = containerEl.children[0];
    let tempEl = containerEl.children[1];
    let imgEl = containerEl.children[2];
    let textEl = containerEl.children[3];
    console.log(forecastEl);
    //set the date
    dateEl.innerText = `${dt.getMonth() + 1}-${dt.getDate()}`;
    dt.setDate(dt.getDate() + 1); //increment date
    //set the temp
    let avgTemp = Math.round(forecastEl.day.avgtemp_f);
    tempEl.innerText = `${avgTemp}°`;
    //set the img
    imgEl.innerHTML = `<img src="https:${forecastEl.day.condition.icon}">`;
    textEl.innerText = `${forecastEl.day.condition.text}`;
  }

}
