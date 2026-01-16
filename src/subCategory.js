import { Section } from "./category";
import { DOMtask } from "./components/task";
import keys from "./constant";
import EVENTS from "./events";
import storage from "./storage";
import todoList from "./todo_list";

function SubCategory(navContentHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.SUBCATEGORY, render);
  };

  const subCategoryContent = document.createElement("div");
  subCategoryContent.classList.add("categorySubsectionContent");

  subCategoryContent.innerHTML = `
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
              <span data-option-action="addSection" class="iconSaveSection cursor_pointer">✅</span>
              </div>
              
          <div data-btn="addTask" class="cursor_pointer">Add Task</div>
        </div>
      </div>

      <div class="task_and_subsection_holder"></div>
    </div>
  `;

  const categoryTitle = subCategoryContent.querySelector(".categoryTitle");
  const taskAndSubsectionHolder = subCategoryContent.querySelector(
    ".task_and_subsection_holder"
  );
  const sectionHeader = subCategoryContent.querySelector(".subsection_header");
  const enterSectionCon = subCategoryContent.querySelector(".enterSectionCon");
  const enterSection = subCategoryContent.querySelector(".enterSection");
  const sectionOptions = subCategoryContent.querySelector(".sectionOptions");
  const iconSaveSection = subCategoryContent.querySelector(".iconSaveSection");

  const returnBack = subCategoryContent.querySelector(".return_back");

  const btnDeleteCategory = document.createElement("div");

  btnDeleteCategory.textContent = "Delete Project";
  btnDeleteCategory.classList.add("cursor_pointer");
  btnDeleteCategory.setAttribute("data-btn", "deleteCategory");

  const inboxArr = [];

  const pushTaskToInboxArr = (task) => {
    inboxArr.push(task);
  };

  const displayTaskInSubsection = (sectionHolder) => {
    const appendTaskToSubsection = (task) => {
      sectionHolder.append(task);
    };

    inboxArr.forEach((task) => {
      DOMtask.set(task, appendTaskToSubsection);
    });
  };

  const taskInSubsection = (category) => {
    const key = getCategoryKey(category, ["sections", "tasks"]);

    if (Array.isArray(category[key])) {
      filterTasks(category[key], undefined, undefined, pushTaskToInboxArr);
    }
  };

  const CreateTaskNotInSectionHolder = () => {
    const taskHolder = document.createElement("div");
    taskHolder.classList.add("taskHolder");

    const getTaskHolder = () => taskHolder.cloneNode(true);

    return { getTaskHolder };
  };

  const createTaskNotInSectionHolder = CreateTaskNotInSectionHolder();

  const handleDisplayTaskNotInSection = (tasks) => {
    const taskHolder = createTaskNotInSectionHolder.getTaskHolder();

    const appendTask = (task) => {
      taskHolder.append(task);
    };

    tasks.forEach((task) => {
      DOMtask.set(task, appendTask);
    });

    taskAndSubsectionHolder.append(taskHolder);
  };

  const resetSubsection = () => {
    taskAndSubsectionHolder.innerHTML = "";
  };

  const sectionEllipseOptions = (function createSectionEllipseOptions() {
    const div = document.createElement("div");
    div.classList.add("sectionEllipseOptions", "close");

    div.innerHTML = `
      <div data-btn="addTask" class="cursor_pointer">Add Task</div>
      <div data-btn="deleteSection">Delete Section</div>
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

  const setSectionTAEAttr = (sectionTitleAndEllipse, index) => {
    const categoryRef = sectionHeader.getAttribute("data-category-reference");

    sectionTitleAndEllipse.setAttribute(
      "data-category-reference",
      `${categoryRef},${index}`
    );
  };

  function returnToPreviousPage() {
    PubSub.publish(EVENTS.NAV_RENDER_PREVIOUS);
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
      sectionEllipseOptions.style.bottom = `${bottomValue + 10}px`;
    } else {
      sectionEllipseOptions.style.top = `${topOfParent + 30}px`;
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

  function setCatRefToOptions(e) {
    const elemWithCategoryRef = e.target.closest("[data-category-reference]");
    const elem = e.target.closest(".task_and_subsection_holder");

    if (!elemWithCategoryRef) return;

    const categoryRef = elemWithCategoryRef.getAttribute(
      "data-category-reference"
    );

    if (!elem) {
      sectionOptions.setAttribute("data-category-reference", categoryRef);
    } else {
      sectionEllipseOptions.setAttribute(
        "data-category-reference",
        categoryRef
      );
    }
  }

  function handleOptionsInEllipse(e) {
    const option = e.target.dataset.btn;

    const elemWithCategoryRef = e.target.closest("[data-category-reference]");

    if (!elemWithCategoryRef) return;

    const categoryRef = path.constructCategoryReference(elemWithCategoryRef);

    if (option === "addTask") {
      if (categoryRef.length === 2) {
        categoryRef.push(0);
      }

      categoryReference.update(categoryRef);

      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD_TASK_DIALOG, categoryRef);
    }

    categoryReference.update(categoryRef);

    const categoryIndex = +categoryTitle.getAttribute("data-category-index");

    if (option === "deleteSection") {
      todoList.delete();
      render();
    } else if (option === "deleteCategory") {
      todoList.delete();
      returnToPreviousPage();
    }
  }

  const OptionAction = {
    addSection: () => {
      todoList.add(new Section({ title: enterSection.value }));
      render();
    }
  };

  function handleOptionAction(e) {
    const optionAction = e.target.dataset.optionAction;

    if (!optionAction) return;

    OptionAction[optionAction]();
  }

  // Initial rendering
  const handleDisplayTaskInSection = (arrOfCategory) => {
    resetSubsection();

    for (let i = 1; i < arrOfCategory.length; i++) {
      const sectionElem = createTaskInSectionHolder.getSectionHolder();

      const sectionObj = arrOfCategory[i];

      const sectionTitle =
        sectionElem.sectionTitleAndEllipse.querySelector(".subsection_title");

      sectionTitle.textContent = sectionObj[keys.sectionTitle];

      setSectionTAEAttr(sectionElem.sectionTitleAndEllipse, i);

      taskAndSubsectionHolder.append(sectionElem.sectionTitleAndEllipse);

      const appendTaskToSection = (taskElem) => {
        sectionElem.sectionHolder.append(taskElem);
      };

      sectionObj[keys.tasks].forEach((taskObj) => {
        DOMtask.set(taskObj, appendTaskToSection);
      });

      taskAndSubsectionHolder.append(sectionElem.sectionHolder);

      inboxArr.splice(0);
    }

    taskAndSubsectionHolder.append(sectionEllipseOptions);
  };

  const setCategoryTitleData = (title) => {
    categoryTitle.textContent = title;
    categoryTitle.setAttribute("data-category-path", `${todoList.pathGet}`);
  };

  const render = () => {
    navContentHolder.append(subCategoryContent);

    const todoLstObj = storage.get(keys.todo_list);

    if (todoList.pathGet().length > 1) {
      const { index, subsequentArrOfCategory } =
        todoList.getSubsequentArrOfCategory(todoLstObj);

      const myProject = subsequentArrOfCategory[index];

      setCategoryTitleData(myProject[keys.projectTitle]);
      handleDisplayTaskNotInSection(myProject[keys.sections][0]);
      handleDisplayTaskInSection(myProject[keys.sections]);
    } else {
      setCategoryTitleData(todoList.pathLast());
      const arrOfCategory = todoList.getArrOfCategory(todoLstObj);
      handleDisplayTaskNotInSection(arrOfCategory[0]);
      handleDisplayTaskInSection(arrOfCategory);
    }
  };

  subCategoryContent.addEventListener("click", (e) => {
    displaySectionOption(e);
    displayOption(e);
    setCatRefToOptions(e);
    handleOptionsInEllipse(e);
  });

  sectionOptions.addEventListener("click", handleOptionAction);

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

export default SubCategory;
