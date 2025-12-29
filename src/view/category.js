import { setTaskValue } from "../components/task";
import EVENTS from "../config/EVENTS";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority,
  path
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

  const taskToBeAdjusted = [];

  const MyProjectCategory = {};

  const pushTaskToArrForAdjustment = (task) => {
    taskToBeAdjusted.push(task);
  };

  const setNumberOfInbox = () => {
    numberOfInbox.textContent = +numberOfInbox.textContent + 1;
  };

  const handleDisplayOfMyProjectCategory = (task) => {
    if (MyProjectCategory[category] === undefined) return;

    const categoryTitle = path.generateCategory(task)[1];

    if (!MyProjectCategory[categoryTitle]) MyProjectCategory[categoryTitle] = 1;

    MyProjectCategory[categoryTitle]++;
  };

  const isTaskInBoxCategory = (task) => {
    const category = task.category[0];

    if (category === "Inbox") {
      setNumberOfInbox();
    } else {
      handleDisplayOfMyProjectCategory(task);
    }
  };

  function CategoryElement() {
    const categoryElement = document.createElement("div");

    categoryElement.innerHTML = `
    <p><span>#</span> <span class="categoryTitle"></span> <span class="numberOfTaskInCategory"></span>
    `;

    const template = () => categoryElement.clone(true);

    return { template };
  }

  const categoryElement = CategoryElement();

  const displayCategory = (title, count) => {
    const element = categoryElement.template();

    const categoryTitle = element.querySelector(".categoryTitle");
    const numberOfTaskInCategory = element.querySelector(
      ".numberOfTaskInCategory"
    );

    categoryTitle.textContent = title;
    numberOfTaskInCategory.textContent = count;

    myProjectCategorySection.append(element);
  };

  const organizeMyProjectCategory = () => {
    for (let categoryTitle in MyProjectCategory) {
      console.log(categoryTitle);
      displayCategory(categoryTitle, MyProjectCategory[categoryTitle]);
    }
  };

  const resetCategory = () => {
    numberOfInbox.textContent = 0;
    taskToBeAdjusted.splice(0);
  };

  const handleTodayAndOverdueTask = () => {
    resetCategory();

    for (let key in taskAndCategoryHandler.getCategories()) {
      filterTasks(
        taskAndCategoryHandler.getCategories()[key],
        undefined,
        undefined,
        pushTaskToArrForAdjustment
      );
    }

    taskToBeAdjusted.sort(sortTaskBaseOnPriority);
    taskToBeAdjusted.forEach(isTaskInBoxCategory);

    organizeMyProjectCategory();
  };

  const render = () => {
    main.append(categoryContent);
    handleTodayAndOverdueTask();
  };

  const removeCategoryView = () => {
    categoryContent.remove();
  };

  return { init };
}

export default CategoryPage;
