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
      
      <h2 class="heading_tasks">Tasks</h2>
      
      <div class="searchContentHolder"></div>
    </div>
  `;

  const searchBar = searchContent.querySelector(".searchBar");
  const searchContentHolder = searchContent.querySelector(
    ".searchContentHolder"
  );

  const searchContentEmpty = document.createElement("div");
  searchContentEmpty.classList.add("searchContentEmpty");
  searchContentEmpty.innerHTML = "🫗";

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

  const isSearchTaskToBeAdjusted = () => {
    if (searchTaskToBeAdjusted.length === 0) {
      searchContentHolder.append(searchContentEmpty);
    }
  };

  function handleSearchTask(e) {
    resetSearchHolder();

    const searchTaskValue = searchBar.value;

    if (searchTaskValue.trim() === "") {
      searchContentHolder.append(searchContentEmpty);
      return;
    }

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

    isSearchTaskToBeAdjusted();
  }

  const render = () => {
    main.append(searchContent);
    handleSearchTask();
  };

  searchBar.addEventListener("input", handleSearchTask);

  return { init };
}

export default Search;
