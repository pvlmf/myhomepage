import { calendar } from "./calendar.js"
import { getWeather } from "./weather.js"
import { updateClock } from "./update-clock.js"

calendar();

getWeather().catch((e) => {
  console.error("天気の取得に失敗", e);
  document.getElementById("weather").textContent = "天気の取得に失敗しました。";
});

updateClock();
setInterval(updateClock ,1000);
