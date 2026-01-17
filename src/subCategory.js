import { Section } from "./category";
import { DOMtask } from "./components/task";
import keys from "./constant";
import Dataset from "./datasets";
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
      <div class="myProjectHeader">
        <span
          class="return_back cursor_pointer"
          data-my-project-header-action="returnToPreviousPage"
          >⬅️</span
        >
        <span class="myProjectTitle"></span>
        <span
          class="category_ellipse cursor_pointer"
          data-my-project-header-action="displayMyProjectOption"
          >&vellip;</span
        >

        <div class="myProjectOption close">
          <div
            data-add="section"
            data-remain
            class="cursor_pointer"
            data-my-project-option-action="showFieldForSection"
          >
            Add Section
          </div>

          <div class="enterSectionFieldCon hide">
            <input
              name="enterSection"
              class="enterSection"
              data-remain
              placeholder="Enter Section Name"
            />
            <span
              data-my-project-option-action="addSection"
              class="iconSaveSection cursor_pointer"
              >✅</span
            >
          </div>

          <div data-my-project-option-action="addTask" class="cursor_pointer">
            Add Task
          </div>
        </div>
      </div>

      <div class="taskNotInSectionHolder"></div>

      <div class="task_and_subsection_holder"></div>
    </div>
  `;

  const myProjectTitle = subCategoryContent.querySelector(".myProjectTitle");
  const taskAndSubsectionHolder = subCategoryContent.querySelector(
    ".task_and_subsection_holder"
  );
  const taskNotInSectionHolder = subCategoryContent.querySelector(
    ".taskNotInSectionHolder"
  );
  const myProjectHeader = subCategoryContent.querySelector(".myProjectHeader");
  const enterSectionFieldCon = subCategoryContent.querySelector(
    ".enterSectionFieldCon"
  );
  const enterSection = subCategoryContent.querySelector(".enterSection");
  const myProjectOption = subCategoryContent.querySelector(".myProjectOption");

  const btnAddSection = subCategoryContent.querySelector(
    '[data-my-project-option-action="addSection"]'
  );

  const returnBack = subCategoryContent.querySelector(".return_back");

  const btnDeleteCategory = document.createElement("div");

  btnDeleteCategory.textContent = "Delete Project";
  btnDeleteCategory.classList.add("cursor_pointer");
  btnDeleteCategory.setAttribute(
    "data-my-project-option-action",
    "deleteMyProject"
  );

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

  const handleDisplayTaskNotInSection = (tasks) => {
    const appendTask = (task) => {
      taskNotInSectionHolder.append(task);
    };

    tasks.forEach((taskObj) => {
      DOMtask.set(taskObj, appendTask);
    });
  };

  const resetLayout = () => {
    taskNotInSectionHolder.innerHTML = "";
    taskAndSubsectionHolder.innerHTML = "";
  };

  const sectionOptions = (function createSectionOptions() {
    const div = document.createElement("div");
    div.classList.add("sectionOptions", "close");

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
    ellipse.setAttribute("data-section-action", "displaySectionOption");

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

  function returnToPreviousPage() {
    PubSub.publish(EVENTS.NAV_RENDER_PREVIOUS);
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

  function displayOption(e) {
    const displayOption = e.target.dataset.displayOption;

    if (displayOption) {
    } else {
      sectionOptions.classList.add("close");
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
      myProjectOption.setAttribute("data-category-reference", categoryRef);
    } else {
      sectionOptions.setAttribute("data-category-reference", categoryRef);
    }
  }

  // function handleOptionsInEllipse(e) {
  //   const option = e.target.dataset.btn;

  //   const elemWithCategoryRef = e.target.closest("[data-category-reference]");

  //   if (!elemWithCategoryRef) return;

  //   const categoryRef = path.constructCategoryReference(elemWithCategoryRef);

  //   if (option === "addTask") {
  //     if (categoryRef.length === 2) {
  //       categoryRef.push(0);
  //     }

  //     categoryReference.update(categoryRef);

  //     PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD_TASK_DIALOG, categoryRef);
  //   }

  //   categoryReference.update(categoryRef);

  //   const categoryIndex = +myProjectTitle.getAttribute("data-category-index");

  //   if (option === "deleteSection") {
  //     todoList.delete();
  //     render();
  //   } else if (option === "deleteCategory") {
  //     todoList.delete();
  //     returnToPreviousPage();
  //   }
  // }

  // Handle action in options
  const OptionAction = {
    addSection: () => {
      if (enterSection.value.trim() === "") {
        btnAddSection.setAttribute("data-remain", "");
      } else {
        btnAddSection.removeAttribute("data-remain");

        todoList.add(new Section({ title: enterSection.value }));
        enterSection.value = "";
        render();
      }
    },
    showFieldForSection: () => enterSectionFieldCon.classList.toggle("hide"),
    addTask: () => {
      PubSub.publish(EVENTS.SHOW_TASK_DIALOG);
    },
    deleteMyProject: () => {
      todoList.delete();
      returnToPreviousPage();
    }
  };

  function handleMyProjectOptionAction(e) {
    const myProjectOptionAction = e.target.dataset.myProjectOptionAction;

    if (!myProjectOptionAction) return;

    OptionAction[myProjectOptionAction]();
  }

  // Handle closing of option
  const datasets = [
    new Dataset(
      "myProjectHeaderAction",
      "displayMyProjectOption",
      myProjectOption
    ),
    new Dataset("sectionAction", "displaySectionOption", sectionOptions)
  ];

  function handleCategoryOptionClose(e) {
    datasets.forEach((obj) => {
      if (
        e.target.dataset[obj.key] !== obj.value &&
        !e.target.hasAttribute("data-remain")
      )
        obj.elem.classList.add("close");
    });
  }
  // Action in Section

  const displaySectionOption = (target) => {
    const parent = target.closest(".sectionTitleAndEllipse");

    const topOfParent = getTopOfParent(parent);
    const bottomOfTaskAndSectionHolder = getBottomOfTASHolder();

    const HEIGHT_OF_SECTION_OPTION = 81;

    if (topOfParent + HEIGHT_OF_SECTION_OPTION > bottomOfTaskAndSectionHolder) {
      const bottomOfParent = getBottomOfParent(parent);

      const bottomValue = bottomOfTaskAndSectionHolder - bottomOfParent;

      sectionOptions.style.top = "auto";
      sectionOptions.style.bottom = `${bottomValue + 10}px`;
    } else {
      sectionOptions.style.top = `${topOfParent + 30}px`;
      sectionOptions.style.bottom = "auto";
    }

    sectionOptions.classList.toggle("close");
  };

  const SectionAction = {
    displaySectionOption
  };

  function handleSectionAction(e) {
    const sectionAction = e.target.dataset.sectionAction;
    if (!sectionAction) return;

    const elemWithCategoryPath = e.target.closest("[data-category-path]");
    const categoryPath =
      elemWithCategoryPath.getAttribute("data-category-path");
    todoList.pathUpdate(categoryPath);

    SectionAction[sectionAction](e.target);
  }

  // Action in MyProjectHeader
  const displayMyProjectOption = () => {
    todoList.pathFirst() === keys.inbox
      ? btnDeleteCategory.remove()
      : myProjectOption.append(btnDeleteCategory);

    myProjectOption.classList.toggle("close");
  };

  const MyProjectHeaderAction = {
    displayMyProjectOption,
    returnToPreviousPage
  };

  function handleMyProjectHeaderAction(e) {
    const myProjectHeaderAction = e.target.dataset.myProjectHeaderAction;
    if (!myProjectHeaderAction) return;

    const categoryPath = myProjectHeader.getAttribute("data-category-path");
    todoList.pathUpdate(categoryPath);
    MyProjectHeaderAction[myProjectHeaderAction]();
  }

  // Initial rendering
  const setCategoryPathValueInSection = (sectionElem, categoryPath) => {
    sectionElem.setAttribute("data-category-path", `${categoryPath}`);
  };

  const handleDisplayTaskInSection = (arrOfCategory) => {
    for (let i = 1; i < arrOfCategory.length; i++) {
      const sectionElem = createTaskInSectionHolder.getSectionHolder();

      const sectionObj = arrOfCategory[i];

      const sectionTitle =
        sectionElem.sectionTitleAndEllipse.querySelector(".subsection_title");

      sectionTitle.textContent = sectionObj[keys.sectionTitle];

      setCategoryPathValueInSection(
        sectionElem.sectionTitleAndEllipse,
        sectionObj[keys.categoryPath]
      );

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

    taskAndSubsectionHolder.append(sectionOptions);
  };

  const setCategoryTitleData = (title) => {
    myProjectHeader.setAttribute("data-category-path", `${todoList.pathGet()}`);
    myProjectTitle.textContent = title;
  };

  const render = () => {
    navContentHolder.append(subCategoryContent);
    resetLayout();

    const todoLstObj = storage.get(keys.todo_list);

    todoList.pathUpdate(todoList.pathGet().slice(0, 2));

    // if todoList.pathGet().length > 1 then it is loading MyProject in the subCategory, else it is loading inbox
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
    handleCategoryOptionClose(e);
    // displaySectionOption(e);
    // displayOption(e);
    // setCatRefToOptions(e);
    // handleOptionsInEllipse(e);
  });

  myProjectHeader.addEventListener("click", handleMyProjectHeaderAction);

  myProjectOption.addEventListener("click", handleMyProjectOptionAction);

  taskAndSubsectionHolder.addEventListener("click", handleSectionAction);

  returnBack.addEventListener("click", returnToPreviousPage);

  return { init };
}

export default SubCategory;
