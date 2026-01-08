import { setTaskValue } from "../components/task";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority,
  getCategoryKey,
  categoryTypeHandler
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
        <span class="return_back cursor_pointer">⬅️</span>
        <span class="categoryTitle">Inbox</span>
        <span class="category_ellipse cursor_pointer" data-display="sectionOption">&vellip;</span>

        <div class="sectionOptions close">
          <div data-add="section"># Add Section</div>

          <div class="enterSectionCon hide">
            <input
              name="enterSection"
              class="enterSection"
              data-avoid="true"
              placeholder="Enter Section Name"
            />
            <span class="iconSaveSection cursor_pointer">✅</span>
          </div>
        </div>
      </div>

      <div class="task_and_subsection_holder"></div>
    </div>
  `;

  const categoryTitle =
    CategorySubSectionContent.querySelector(".categoryTitle");
  const taskAndSubsectionHolder = CategorySubSectionContent.querySelector(
    ".task_and_subsection_holder"
  );
  const enterSectionCon =
    CategorySubSectionContent.querySelector(".enterSectionCon");
  const enterSection = CategorySubSectionContent.querySelector(".enterSection");
  const sectionOptions =
    CategorySubSectionContent.querySelector(".sectionOptions");
  const iconSaveSection =
    CategorySubSectionContent.querySelector(".iconSaveSection");

  const returnBack = CategorySubSectionContent.querySelector(".return_back");

  const inboxArr = [];

  const pushTaskToInboxArr = (task) => {
    inboxArr.push(task);
  };

  const displayTaskInSubsection = (sectionHolder) => {
    const appendTaskToSubsection = (task) => {
      sectionHolder.append(task);
    };

    inboxArr.forEach((task) => {
      setTaskValue(task, appendTaskToSubsection);
    });
  };

  const taskInSubsection = (category) => {
    const key = getCategoryKey(category, ["sections", "tasks"]);

    if (Array.isArray(category[key])) {
      filterTasks(category[key], undefined, undefined, pushTaskToInboxArr);
    }
  };

  const updateCategoryTitleAndIndex = (title, categoryIndex, root) => {
    categoryTitle.textContent = title;
    categoryTitle.setAttribute("data-category-index", categoryIndex);
    categoryTitle.setAttribute("data-root", root);
  };

  const CreateTaskNotInSectionHolder = () => {
    const taskHolder = document.createElement("div");
    taskHolder.classList.add("taskHolder");

    const getTaskHolder = () => taskHolder.cloneNode(true);

    return { getTaskHolder };
  };

  const createTaskNotInSectionHolder = CreateTaskNotInSectionHolder();

  const handleDisplayTaskNotInSubsection = (tasks) => {
    const taskHolder = createTaskNotInSectionHolder.getTaskHolder();

    const appendTask = (task) => {
      taskHolder.append(task);
    };

    tasks.forEach((task) => {
      setTaskValue(task, appendTask);
    });

    taskAndSubsectionHolder.append(taskHolder);
  };

  const resetSubsection = () => {
    taskAndSubsectionHolder.innerHTML = "";
  };

  const CreateTaskInSectionHolder = () => {
    const sectionTitle = document.createElement("div");
    const sectionHolder = document.createElement("div");

    sectionTitle.classList.add("subsection_title");
    sectionHolder.classList.add("sectionHolder");

    const getSectionHolder = () => {
      return {
        sectionTitle: sectionTitle.cloneNode(true),
        sectionHolder: sectionHolder.cloneNode(true)
      };
    };

    return { getSectionHolder };
  };

  const createTaskInSectionHolder = CreateTaskInSectionHolder();

  const handleDisplayTaskInSubsection = (categoryArr) => {
    for (let i = 1; i < categoryArr.length; i++) {
      const sectionElem = createTaskInSectionHolder.getSectionHolder();

      const sectionObj = categoryArr[i];

      sectionElem.sectionTitle.textContent = sectionObj.sectionTitle;

      taskAndSubsectionHolder.append(sectionElem.sectionTitle);

      taskInSubsection(sectionObj, i);

      displayTaskInSubsection(sectionElem.sectionHolder);

      taskAndSubsectionHolder.append(sectionElem.sectionHolder);

      inboxArr.splice(0);
    }
  };

  const renderInbox = (msg, { value }) => {
    main.append(CategorySubSectionContent);

    resetSubsection();

    const inbox = taskAndCategoryHandler.getCategories().Inbox;

    updateCategoryTitleAndIndex(value, undefined, "Inbox");
    handleDisplayTaskNotInSubsection(inbox[0]);
    handleDisplayTaskInSubsection(inbox);
  };

  const renderMyProject = (msg, { value, categoryIndex }) => {
    main.append(CategorySubSectionContent);

    resetSubsection();

    const category =
      taskAndCategoryHandler.getCategories().My_Project[+categoryIndex];

    updateCategoryTitleAndIndex(value, categoryIndex, "My_Project");
    handleDisplayTaskNotInSubsection(category.sections[0]);
    handleDisplayTaskInSubsection(category.sections);
  };

  function returnToPreviousPage() {
    PubSub.publish(EVENTS.PAGE.LOAD.PREVIOUS_PAGE);
  }

  const showEnterSection = () => {
    enterSectionCon.classList.toggle("hide");
  };

  function displaySectionOption(e) {
    const avoid = e.target.dataset.avoid;

    if (avoid) return;

    const display = e.target.dataset.display;

    const add = e.target.dataset.add;

    if (add) {
      iconSaveSection.setAttribute("data-category-type", add);
      showEnterSection();
      return;
    }

    if (display) {
      sectionOptions.classList.toggle("close");
    } else {
      sectionOptions.classList.add("close");
    }
  }

  function saveSection(e) {
    const categoryType = e.target.dataset.categoryType;

    if (!categoryType) return;

    const categoryIndex = categoryTitle.getAttribute("data-category-index");
    const root = categoryTitle.getAttribute("data-root");

    categoryTypeHandler[categoryType](enterSection.value, categoryIndex, root);

    enterSection.value = "";

    if (root === "Inbox") {
      renderInbox("", { value: categoryTitle.value, categoryIndex });
    } else {
      renderMyProject("", { value: categoryTitle.value, categoryIndex });
    }
  }

  iconSaveSection.addEventListener("click", saveSection);

  CategorySubSectionContent.addEventListener("click", displaySectionOption);

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

export default CategorySubSection;
