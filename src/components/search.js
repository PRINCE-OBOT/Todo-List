import { DOMtask } from "../components/task";
import keys from "../constant";
import EVENTS from "../events";
import storage from "../storage";
import todoList from "../todo_list";

function Search(navContentHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.SEARCH, render);
  };

  const searchContent = document.createElement("div");
  searchContent.classList.add("search_page");

  searchContent.innerHTML = `
    <div class="heading_section">
      <h2 class="heading">Search</h2>
      <div class="searchBar_section">
        <input type="search" name="searchBar" class="searchBar" placeholder="Search tasks" />
      
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

  const handleDisplayTaskInSearchSection = (taskObj) => {
    if(taskObj.status) return 
    DOMtask.set(taskObj, appendTaskInSearchSection);
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

    const todoListObj = storage.get(keys.todo_list);

    for (const root in todoListObj) {
      todoList.filter(
        todoListObj[root],
        keys.taskTitle,
        searchTaskValue,
        pushSearchTaskToArrForAdjustment
      );
    }

    searchTaskToBeAdjusted.sort(todoList.sortPriority);
    searchTaskToBeAdjusted.forEach(handleDisplayTaskInSearchSection);

    isSearchTaskToBeAdjusted();
  }

  const render = () => {
    navContentHolder.append(searchContent);
    handleSearchTask();
  };

  searchBar.addEventListener("input", handleSearchTask);

  return { init };
}

export default Search;
