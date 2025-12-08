import EVENTS from "../EVENTS/EVENTS";

function MainNavController() {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER, navPage);
  };

  const div = document.createElement("div");
  div.classList.add("mainNavController");

  div.innerHTML = `
    <div data-nav="today">
        <div class="nav-icon">
            📆
        </div>
        Today
    </div>
    
    <div data-nav="search">
        <div class="nav-icon">
            🔍
        </div>
        Search
    </div>
   
    <div data-nav="category">
        <div class="nav-icon">
            📅
        </div>
        Category
    </div>
  `;

  const navPage = () => {
    document.body.append(div);
  };

  return { init };
}
const mainNavController = MainNavController();

export default mainNavController;
