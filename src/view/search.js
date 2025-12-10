import EVENTS from "../config/EVENTS";
import { category } from "../Todo-List/todo-list";

function Search(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.SEARCH, render);
  };

  const div = document.createElement("div");
  div.classList.add("search_page");

  div.innerHTML = `
    <div>
      <div>
        <input type="search" />
        🔍
      </div>
      <div class="search-item"></div>
    </div>
  `;

  const filterTaskBy = (categories, filterKey, filterValue) => {
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        filterTaskBy(category, filterKey, filterValue);
      } else {
        const categorySectionKey = category.categoryTitle
          ? SECTIONS
          : category.sectionTitle
          ? TASKS
          : SUBTASKS;

        if (category.title) {
          if (category[filterKey] === filterValue) {
            console.log(category);
          }
        }

        if (category[categorySectionKey]) {
          filterTaskBy(category[categorySectionKey], filterKey, filterValue);
        }
      }
    });
  };

  const filterTask = () => {
    const Categories = category.getCategories();

    for (let key in Categories) {
      filterTaskBy(Categories[key], "title", "");
    }
  };

  const render = () => {
    main.append(div);
    filterTask();
  };

  return { init };
}

export default Search;
