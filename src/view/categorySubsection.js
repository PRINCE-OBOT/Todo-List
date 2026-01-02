import { setTaskValue } from "../components/task";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority
} from "../config/constant";
import EVENTS from "../config/EVENTS";

function CategorySubSection(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.MY_PROJECT, renderMyProject);
    PubSub.subscribe(EVENTS.PAGE.LOAD.INBOX, renderInbox);
    PubSub.subscribe(EVENTS.PAGE.LOAD.SUBSECTION, renderSubsection);
  };

  const CategorySubSectionContent = document.createElement("div");
  CategorySubSectionContent.innerHTML = `
  <div class="categorySubsectionHeader">
    <div>⬅️</div> <div class="categoryTitle">Inbox</div>

    <div class="taskHolder">
    </div>
  </div>
  `;

  const categoryTitle =
    CategorySubSectionContent.querySelector(".categoryTitle");
  const taskHolder = CategorySubSectionContent.querySelector(".taskHolder");

  const searchTaskToBeAdjusted = [];

  const handleCategoryTask = (category, key) => {
    if (Array.isArray(category[key])) {
      filterTasks(
        category[key],
        undefined,
        undefined,
        pushTaskToMyProjectCategoryArr
      );
    }

    debugger;
    displayCategoryElement(index, myProjectCategoryArr.length);
    myProjectCategoryArr.splice(0);
  };

  const updateCategoryTitle = (title) => {
    categoryTitle.textContent = title;
  };

  const appendTask = (task) => {
    taskHolder.append(task);
  };

  const handleDisplayTaskNotInSubsection = (task) => {
    setTaskValue(task, appendTask);
  };

  const renderInbox = (msg, { categoryTitle }) => {
    main.append(CategorySubSectionContent);

    const inbox = taskAndCategoryHandler.getCategories().Inbox;

    updateCategoryTitle(categoryTitle);
    inbox[0].forEach(handleDisplayTaskNotInSubsection);
    // handleCategoryTask(category, "tasks");
  };

  const renderMyProject = (msg, { categoryIndex }) => {
    main.append(CategorySubSectionContent);

    const category = taskAndCategoryHandler.getCategories().My_Project[index];

    updateCategoryTitle(category.title);
    handleCategoryTask(category, "sections");
  };

  const renderSubsection = () => {
    main.append(CategorySubSectionContent);
  };

  return { init };
}

export default CategorySubSection;
