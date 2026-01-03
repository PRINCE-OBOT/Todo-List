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
  };

  const CategorySubSectionContent = document.createElement("div");
  CategorySubSectionContent.classList.add("categorySubsectionContent");

  CategorySubSectionContent.innerHTML = `
  <div class="taskSectionHolder">
    <div class="subsection_header">
        <span class="return_back">⬅️</span> <span class="categoryTitle">Inbox</span>
    </div>

    <div class="task_and_subsection_holder">
    </div>
    
  </div>
  `;

  const categoryTitle =
    CategorySubSectionContent.querySelector(".categoryTitle");
  const taskSectionHolder =
    CategorySubSectionContent.querySelector(".taskSectionHolder");
  const taskAndSubsectionHolder = CategorySubSectionContent.querySelector(
    ".task_and_subsection_holder"
  );

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

  const CreateTaskNotInSectionHolder = () => {
    const taskHolder = document.createElement("div");

    const getTaskHolder = () => taskHolder.cloneNode(true);

    return { getTaskHolder };
  };

  const createTaskNotInSectionHolder = CreateTaskNotInSectionHolder();

  const appendTask = (task) => {
    const taskHolder = createTaskNotInSectionHolder.getTaskHolder();
    taskHolder.append(task);
    taskAndSubsectionHolder.append(taskHolder);
  };

  const handleDisplayTaskNotInSubsection = (task) => {
    setTaskValue(task, appendTask);
  };

  const resetSubsection = () => {
    taskAndSubsectionHolder.innerHTML = "";
  };

  const CreateTaskInSectionHolder = () => {
    const sectionTitle = document.createElement("div");
    const sectionHolder = document.createElement("div");

    sectionTitle.classList.add("subsection_title");

    const getSectionHolder = () => {
      return {
        sectionTitle: sectionTitle.cloneNode(true),
        sectionHolder: sectionHolder.cloneNode(true)
      };
    };

    return { getSectionHolder };
  };

  const createTaskInSectionHolder = CreateTaskInSectionHolder();

  const appendTaskToItSubsection = () => {};

  const handleDisplayTaskInSubsection = (inbox) => {
    for (let i = 1; i < inbox.length; i++) {
      const sectionElem = createTaskInSectionHolder.getSectionHolder();

      const sectionObj = inbox[i];

      sectionElem.sectionTitle.textContent = sectionObj.sectionTitle;
      sectionElem.sectionHolder.setAttribute("data-section-index", i);

      taskAndSubsectionHolder.append(
        sectionElem.sectionTitle,
        sectionElem.sectionHolder
      );

      taskInSubsection(sectionObj, "tasks", i);
    }
  };

  const renderInbox = (msg, { value }) => {
    main.append(CategorySubSectionContent);

    resetSubsection();

    const inbox = taskAndCategoryHandler.getCategories().Inbox;
    
    updateCategoryTitle(value);
    inbox[0].forEach(handleDisplayTaskNotInSubsection);
    handleDisplayTaskInSubsection(inbox);
  };

  const renderMyProject = (msg, { categoryIndex }) => {
    main.append(CategorySubSectionContent);

    const category = taskAndCategoryHandler.getCategories().My_Project[index];

    updateCategoryTitle(category.title);
    handleCategoryTask(category, "sections");
  };

  function returnToPreviousPage() {
    PubSub.publish(EVENTS.PAGE.LOAD.PREVIOUS_PAGE);
  }

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

// inbox title keep appending again and again, fix it

export default CategorySubSection;
