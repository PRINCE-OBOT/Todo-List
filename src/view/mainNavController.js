import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";

function MainNavController(mainNavigation, changeViewHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER, navPage);
    PubSub.subscribe(EVENTS.PAGE.LOAD.PREVIOUS_PAGE, returnToPreviousPage);
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

  const pagesEventReference = [];

  const returnToPreviousPage = () => {
    pagesEventReference.pop();
    const previousPage = pagesEventReference[pagesEventReference.length - 1];

    mainView({ target: { dataset: { changeMainView: previousPage } } });
  };

  function mainView(e) {
    const changeMainView = e.target.dataset.changeMainView;

    if (!changeMainView) return;

    changeViewHolder.innerHTML = "";

    pagesEventReference.push(changeMainView);

    PubSub.publishSync(EVENTS.PAGE.LOAD[changeMainView], changeMainView);
  }

  const navPage = () => {
    mainNavigation.append(div);
  };

  div.addEventListener("click", mainView);

  return { init, mainView };
}// make this mainNavController to listen when the paid for subsection want to open

export default MainNavController;
