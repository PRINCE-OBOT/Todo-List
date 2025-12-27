import { setTaskValue } from "../components/task";
import {
  taskAndCategoryHandler,
  getTasks,
  sortTaskBaseOnPriority
} from "../config/constant";
import EVENTS from "../config/EVENTS";

function Search(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.SEARCH, render);
  };

  const searchContent = document.createElement("div");
  searchContent.classList.add("search_page");

  searchContent.innerHTML = `
    <div>
      <div>
        <input type="search" class="search" />
        🔍
      </div>
      <div class="searchSection"></div>
    </div>
  `;

  const searchBar = searchContent.querySelector(".search");
  const searchSection = searchContent.querySelector(".searchSection");

  const searchTaskToBeAdjusted = [];

  const pushSearchTaskToArrForAdjustment = (task) => {
    searchTaskToBeAdjusted.push(task);
  };

  const displayTaskInSearchSection = (task) => {
    searchSection.append(task);
  };

  const handleDisplayTaskInSearchSection = (category) => {
    setTaskValue(category, displayTaskInSearchSection);
  };

  const handleSearchTask = () => {
    for (let key in taskAndCategoryHandler.getCategories()) {
      getTasks(
        taskAndCategoryHandler.getCategories()[key],
        "title",
        "one",
        pushSearchTaskToArrForAdjustment
      );
    }

    searchTaskToBeAdjusted.sort(sortTaskBaseOnPriority);
    searchTaskToBeAdjusted.forEach(handleDisplayTaskInSearchSection);
  };

  const render = () => {
    main.append(searchContent);
    handleSearchTask();
  };

  return { init };
}

export default Search;
