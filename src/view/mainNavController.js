import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";

function MainNavController(mainNavigation, changeViewHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER, navPage);
  };

  const div = document.createElement("div");
  div.classList.add("mainNavController");

  div.innerHTML = `
    <div data-change-main-view="TODAY">
        <div class="nav-icon">
            📆
        </div>
        Today
    </div>
    
    <div data-change-main-view="SEARCH">
        <div class="nav-icon">
            🔍
        </div>
        Search
    </div>
   
    <div data-change-main-view="CATEGORY">
        <div class="nav-icon">
            📅
        </div>
        Category
    </div>
  `;

  function mainView(e) {
    const changeMainView = e.target.dataset.changeMainView;

    console.log('run')

    if (!changeMainView) return;

    changeViewHolder.innerHTML = "";

    PubSub.publishSync(EVENTS.PAGE.LOAD[changeMainView], changeMainView);
  }

  div.addEventListener("click", mainView);

  const navPage = () => {
    mainNavigation.append(div);
  };

  return { init };
}

export default MainNavController;
