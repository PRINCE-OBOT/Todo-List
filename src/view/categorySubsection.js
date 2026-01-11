import { setTaskValue } from "../components/task";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority,
  getCategoryKey,
  categoryTypeHandler,
  categoryReference
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
        <span
          class="category_ellipse cursor_pointer"
          data-display="sectionOption"
          >&vellip;</span
        >

        <div class="sectionOptions close">
          <div data-add="section" class="cursor_pointer">Add Section</div>

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

  const btnDeleteCategory = document.createElement("div");

  btnDeleteCategory.textContent = "Delete Project";
  btnDeleteCategory.classList.add("cursor_pointer");
  btnDeleteCategory.setAttribute("data-delete", "section");

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

  // Make the createSectionOptions to be inserted in sectionTitleAndEllipse
  // For deleting of section and updating the reference to the designated section.
  const sectionEllipseOptions = (function createSectionEllipseOptions() {
    const div = document.createElement("div");
    div.classList.add("sectionEllipseOptions", "close");

    div.innerHTML = `
      <div data-display="task" class="cursor_pointer">Add Task</div>
      <div data-delete="section">Delete Section</div>
    `;

    return div;
  })();

  const CreateTaskInSectionHolder = () => {
    const sectionTitleAndEllipse = document.createElement("div");
    const ellipse = document.createElement("div");
    const sectionTitle = document.createElement("div");
    const sectionHolder = document.createElement("div");

    sectionTitleAndEllipse.classList.add("sectionTitleAndEllipse");
    sectionTitle.classList.add("subsection_title");
    sectionHolder.classList.add("sectionHolder");
    ellipse.classList.add("cursor_pointer");
    ellipse.setAttribute("data-display-option", "sectionEllipse");

    ellipse.innerHTML = "&vellip;";

    sectionTitleAndEllipse.append(sectionTitle, ellipse);

    const getSectionHolder = () => {
      return {
        sectionTitleAndEllipse: sectionTitleAndEllipse.cloneNode(true),
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

      const sectionTitle =
        sectionElem.sectionTitleAndEllipse.querySelector(".subsection_title");

      sectionTitle.textContent = sectionObj.sectionTitle;

      taskAndSubsectionHolder.append(sectionElem.sectionTitleAndEllipse);

      taskInSubsection(sectionObj, i);

      displayTaskInSubsection(sectionElem.sectionHolder);

      taskAndSubsectionHolder.append(sectionElem.sectionHolder);

      inboxArr.splice(0);
    }

    taskAndSubsectionHolder.append(sectionEllipseOptions);
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

    updateCategoryTitleAndIndex(
      category.categoryTitle,
      categoryIndex,
      "My_Project"
    );
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
      const { root } = getRootAndIndex();

      if (root === "Inbox") btnDeleteCategory.remove();
      else {
        sectionOptions.append(btnDeleteCategory);
      }

      sectionOptions.classList.toggle("close");
    } else {
      sectionOptions.classList.add("close");
    }
  }

  const getRootAndIndex = () => {
    const categoryIndex = categoryTitle.getAttribute("data-category-index");
    const root = categoryTitle.getAttribute("data-root");

    return { root, categoryIndex };
  };

  function saveSection(e) {
    const categoryType = e.target.dataset.categoryType;

    if (!categoryType) return;

    const { categoryIndex, root } = getRootAndIndex();

    categoryTypeHandler[categoryType](enterSection.value, categoryIndex, root);

    enterSection.value = "";

    if (root === "Inbox") {
      renderInbox("", { value: categoryTitle.value, categoryIndex });
    } else {
      renderMyProject("", { value: categoryTitle.value, categoryIndex });
    }
  }

  function deleteCategory() {
    const { categoryIndex, root } = getRootAndIndex();

    categoryReference.update([root, +categoryIndex]);

    taskAndCategoryHandler.deleteTask();

    returnToPreviousPage();
  }

  const getTopOfParent = (parent) => {
    const rect = parent.getBoundingClientRect();

    return rect.top;
  };

  const getBottomOfParent = (parent) => {
    const rect = parent.getBoundingClientRect();
    return rect.bottom;
  };

  const getBottomOfTASHolder = () => {
    const rect = taskAndSubsectionHolder.getBoundingClientRect();
    return rect.bottom;
  };

  const displaySectionEllipse = (target) => {
    const parent = target.closest(".sectionTitleAndEllipse");

    const topOfParent = getTopOfParent(parent);
    const bottomOfTaskAndSectionHolder = getBottomOfTASHolder();

    const HEIGHT_OF_SECTION_OPTION = 81;

    if (topOfParent + HEIGHT_OF_SECTION_OPTION > bottomOfTaskAndSectionHolder) {
      const bottomOfParent = getBottomOfParent(parent);

      const bottomValue = bottomOfTaskAndSectionHolder - bottomOfParent;

      sectionEllipseOptions.style.top = "auto";
      sectionEllipseOptions.style.bottom = `${bottomValue}px`;
    } else {
      sectionEllipseOptions.style.top = `${topOfParent}px`;
      sectionEllipseOptions.style.bottom = "auto";
    }

    sectionEllipseOptions.classList.toggle("close");
  };

  function displayOption(e) {
    const displayOption = e.target.dataset.displayOption;

    if (displayOption) {
      displaySectionEllipse(e.target);
    } else {
      sectionEllipseOptions.classList.add("close");
    }
  }

  iconSaveSection.addEventListener("click", saveSection);

  btnDeleteCategory.addEventListener("click", deleteCategory);

  CategorySubSectionContent.addEventListener("click", (e) => {
    displaySectionOption(e);
    displayOption(e);
  });

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

export default CategorySubSection;
