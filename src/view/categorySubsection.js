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
  CategorySubSectionContent.classList.add("categorySubsectionContent");

  CategorySubSectionContent.innerHTML = `
  <div class="taskSectionHolder">
    <div>
        <span class="return_back">⬅️</span> <span class="categoryTitle">Inbox</span>
    </div>

    <div class="taskHolder">
    </div>
  </div>
  `;

  const categoryTitle =
    CategorySubSectionContent.querySelector(".categoryTitle");
  const taskSectionHolder =
    CategorySubSectionContent.querySelector(".taskSectionHolder");
  const taskHolder = CategorySubSectionContent.querySelector(".taskHolder");

  const returnBack = CategorySubSectionContent.querySelector(".return_back");

  const handleCategoryTask = (category, key) => {
    if (Array.isArray(category[key])) {
      filterTasks(
        category[key],
        undefined,
        undefined,
        pushTaskToMyProjectCategoryArr
      );
    }

    displayCategoryElement(index, myProjectCategoryArr.length);
    myProjectCategoryArr.splice(0);
  };

  const inboxArr = [];

  const pushTaskToInboxArr = (task) => {
    inboxArr.push(task);
  };

  const displayTaskInSubsection = (index) => {
    const subsection = taskSectionHolder.querySelector(
      `[data-section-index="${index}"]`
    );

    const appendTaskToSubsection = (task) => {
      subsection.append(task);
    };

    inboxArr.forEach((task) => {
      setTaskValue(task, appendTaskToSubsection);
    });
  };

  const taskInSubsection = (category, key, index) => {
    if (Array.isArray(category[key])) {
      filterTasks(category[key], undefined, undefined, pushTaskToInboxArr);
    }

    displayTaskInSubsection(index);
    inboxArr.splice(0);
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

  const resetSubsection = () => {
    taskHolder.innerHTML = "";
  };

  const appendTaskToItSubsection = () => {};

  const handleDisplayTaskInSubsection = (inbox) => {
    for (let i = 1; i < inbox.length; i++) {
      const title = document.createElement("div");
      const subsectionHolder = document.createElement("div");

      title.classList.add("subsection_title");

      const section = inbox[i];

      title.textContent = section.sectionTitle;
      subsectionHolder.setAttribute("data-section-index", i);

      taskSectionHolder.append(title, subsectionHolder);

      taskInSubsection(section, "tasks", i);
    }
  };

  const renderInbox = (msg, { categoryTitle }) => {
    resetSubsection();

    main.append(CategorySubSectionContent);

    const inbox = taskAndCategoryHandler.getCategories().Inbox;

    updateCategoryTitle(categoryTitle);
    inbox[0].forEach(handleDisplayTaskNotInSubsection);
    handleDisplayTaskInSubsection(inbox);
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

  function returnToPreviousPage() {
    
    PubSub.publish(EVENTS.PAGE.LOAD.PREVIOUS_PAGE);
  }

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

export default CategorySubSection;
