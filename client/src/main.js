import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";
import { Home } from "./pages/home.js";
import { About } from "./pages/about.js";

document.querySelector("#app").innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

const routes = {
  "/": Home,
  "/about": About,
};

function router() {
  const path = window.location.pathname;
  const app = document.getElementById("app");
  app.innerHTML = routes[path] ? routes[path]() : "<h1>404 Not Found</h1>";
}

// Link interception
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    const url = e.target.href;
    history.pushState(null, null, url);
    router();
  }
});

// Listen to back/forward buttons
window.addEventListener("popstate", router);

// Initial load
router();

setupCounter(document.querySelector("#counter"));
