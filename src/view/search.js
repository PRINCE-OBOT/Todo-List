import { setTaskValue } from "../components/task";
import {
  taskAndCategoryHandler,
  filterTasks,
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
    <div class="heading_section">
      <h2 class="heading">Search</h2>
      <div class="searchBar_section">
        <input type="search" class="searchBar" placeholder="Search tasks" />
      </div>
      <div class="searchContentHolder"></div>
    </div>
  `;

  const searchBar = searchContent.querySelector(".searchBar");
  const searchContentHolder = searchContent.querySelector(
    ".searchContentHolder"
  );

  const searchTaskToBeAdjusted = [];

  const pushSearchTaskToArrForAdjustment = (task) => {
    searchTaskToBeAdjusted.push(task);
  };

  const appendTaskInSearchSection = (task) => {
    searchContentHolder.append(task);
  };

  const handleDisplayTaskInSearchSection = (task, _, arr) => {
    setTaskValue(task, appendTaskInSearchSection);
  };

  const resetSearchHolder = () => {
    searchTaskToBeAdjusted.splice(0);
    searchContentHolder.innerHTML = "";
  };

  function handleSearchTask(e) {
    resetSearchHolder();
    
    const searchTaskValue = searchBar.value
    
    if (searchTaskValue.trim() === "") return;

    for (let key in taskAndCategoryHandler.getCategories()) {
      filterTasks(
        taskAndCategoryHandler.getCategories()[key],
        "title",
        searchTaskValue,
        pushSearchTaskToArrForAdjustment
      );
    }

    searchTaskToBeAdjusted.sort(sortTaskBaseOnPriority);
    searchTaskToBeAdjusted.forEach(handleDisplayTaskInSearchSection);
  }

  const render = () => {
    main.append(searchContent);
    handleSearchTask();
  };

  searchBar.addEventListener("input", handleSearchTask);

  return { init };
}

export default Search;
