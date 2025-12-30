import { setTaskValue } from "../components/task";
import EVENTS from "../config/EVENTS";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority,
  path,
  categoryReference
} from "../config/constant";
import PubSub from "pubsub-js";

function CategoryPage(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.CATEGORY, render);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.CATEGORY, removeCategoryView);
  };

  const categoryContent = document.createElement("div");
  categoryContent.classList.add("category_page");

  categoryContent.innerHTML = `
    <div>
      <h2>Category</h2>
    </div>

    <div class="category_section_holder">
        <div class="inbox_filter_completed_section">
            <p class="icon_and_title"><span>📥</span> <span>Inbox</span> <span class="number_of_inbox"></span></p>
        </div>
        
        <div>
            <p>My Projects</p>
            <div class="myProjectCategorySection"></div>
        </div>
    </div>
  `;

  const numberOfInbox = categoryContent.querySelector(".number_of_inbox");
  const myProjectCategorySection = categoryContent.querySelector(
    ".myProjectCategorySection"
  );

  const setNumberOfInbox = (inboxArr) => {
    // numberOfInbox.textContent = inboxArr.length;
  };

  function CategoryElement() {
    // Make individual categoryElement to be a component - when click should open the subsection if available and subtask
    const categoryElement = document.createElement("div");

    categoryElement.innerHTML = `
    <p><span>#</span> <span class="categoryTitle"></span> <span class="numberOfTaskInCategory"></span>
    `;

    const template = () => categoryElement.cloneNode(true);

    return { template };
  }

  const categoryElement = CategoryElement();

  const displayCategoryElement = (title, count) => {
    const element = categoryElement.template();

    const categoryTitle = element.querySelector(".categoryTitle");
    const numberOfTaskInCategory = element.querySelector(
      ".numberOfTaskInCategory"
    );

    categoryTitle.textContent = title;
    numberOfTaskInCategory.textContent = count;

    myProjectCategorySection.append(element);
  };

  const categoryTaskStore = {};

  const resetCategory = () => {
    for (let key in categoryTaskStore) {
      delete categoryTaskStore[key];
    }
  };

  const myProjectCategoryArr = [];

  const pushTaskToMyProjectCategoryArr = (task) => {
    myProjectCategoryArr.push(task);
  };

  const getCategoryInformation = (category) => {
    if (Array.isArray(category.sections)) {
      filterTasks(
        category.sections,
        undefined,
        undefined,
        pushTaskToMyProjectCategoryArr
      );
    }

    displayCategoryElement(category.categoryTitle, myProjectCategoryArr.length);
    myProjectCategoryArr.splice(0);
  };

  const handleProjectCategory = () => {
    const categoryInMyProject =
      taskAndCategoryHandler.getCategories().My_Project;

    categoryInMyProject.forEach(getCategoryInformation);
  };

  const pushTaskInboxTaskStore = (task) => {
    if (!categoryTaskStore.Inbox) categoryTaskStore.Inbox = [];
    categoryTaskStore.Inbox.push(task);
  };

  const handleCategoryTask = () => {
    resetCategory();

    const categories = taskAndCategoryHandler.getCategories();

    filterTasks(categories.Inbox, undefined, undefined, pushTaskInboxTaskStore);

    setNumberOfInbox(categoryTaskStore.Inbox);

    handleProjectCategory();
  };

  const render = () => {
    main.append(categoryContent);
    handleCategoryTask();
  };

  const removeCategoryView = () => {
    categoryContent.remove();
  };

  return { init };
}

export default CategoryPage;

/* 
How to reference a category 
todo.categoryReference.update(['My_Project'])

How to add a category
todo.taskAndCategoryHandler.addCategory({ categoryTitle: 'holiday', sections: [[]]})

 */
