import PubSub from "pubsub-js";
import EVENTS from "../events";
import keys from "../constant";
import storage from "../storage";
import todoList from "../todo_list";
import { MyProject } from "../category";
import { DOMtask } from "./task";
import Modal from "../datasets";

function Category(navContentHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.CATEGORY, render);
  };

  const categoryContent = document.createElement("div");
  categoryContent.classList.add("category_page");

  categoryContent.innerHTML = `
    <div>
      <h2>Category</h2>
    </div>

    <div class="category_section_holder">
        <div class="inbox_section">
            <p class="icon_and_title" data-category="INBOX"><span>📥</span> <span class="title cursor_pointer" data-category-path="${keys.inbox}">${keys.inbox}</span> <span class="number_of_inbox"></span></p>
        </div>
       
        <div class="completed_section">
            <p class="icon_and_title" data-category="COMPLETED"><span>©️</span> <span class="title cursor_pointer">Completed</span> <span class="arrow_view_competed_task cursor_pointer">⤵️</span></p>
        </div>

        <div class="list_of_completed_task_section hide">
        </div>
        
        <div class="project_title_and_myProjectCategorySection">
            <div class="project_title_and_ellipse">
              <p>${keys.myProject}s</p><p class="cursor_pointer myProjectsEllipse" data-my-project-ellipse-action="showFieldToEnterMyProject">&vellip;</p>

              <div class="projectOptions close">
                <div data-my-project-option-action="showFieldToAddMyProject" data-remain># Add Project</div>
                
                <div class="enterCategorySection hide">
                  <input name="enterCategory" class="enterCategory" data-remain placeholder="Enter Category Name"/>
                  <span class="iconSaveCategory cursor_pointer">✅</span>
                </div>
              </div>
            </div>
            <div class="myProjectCategorySection" data-category="MY_PROJECT"></div>
        </div>
    </div>
  `;

  const inboxSection = categoryContent.querySelector(".inbox_section");
  const numberOfInbox = categoryContent.querySelector(".number_of_inbox");
  const myProjectCategorySection = categoryContent.querySelector(
    ".myProjectCategorySection"
  );

  const projectOptions = categoryContent.querySelector(".projectOptions");

  const enterCategorySection = categoryContent.querySelector(
    ".enterCategorySection"
  );
  const iconSaveCategory = categoryContent.querySelector(".iconSaveCategory");
  const enterCategory = categoryContent.querySelector(".enterCategory");

  const listOfCompletedTaskSection = categoryContent.querySelector(
    ".list_of_completed_task_section"
  );
  const arrowViewCompetedTask = categoryContent.querySelector(
    ".arrow_view_competed_task"
  );
  const myProjectsEllipse = categoryContent.querySelector(".myProjectsEllipse");

  const taskForAdjustment = [];

  // Handle closing of option
  const datasets = [
    new Modal(
      "myProjectEllipseAction",
      "showFieldToEnterMyProject",
      projectOptions
    )
  ];

  const showFieldToAddMyProject = () => {
    enterCategorySection.classList.toggle("hide");
  };

  const MyProjectOptionAction = {
    showFieldToAddMyProject
  };

  function handleMyProjectOptionAction(e) {
    const myProjectOptionAction = e.target.dataset.myProjectOptionAction;

    if (!myProjectOptionAction) return;

    MyProjectOptionAction[myProjectOptionAction]();
  }

  function toggleDisplayMyProjectOption(e) {
    projectOptions.classList.toggle("close");
  }

  function addMyProject() {
    if (enterCategory.value.trim() === "") return;

    todoList.pathUpdate([keys.myProject]);
    todoList.addMyProject({ title: enterCategory.value });

    enterCategory.value = "";

    render();
  }

  function handleNavigation(e) {
    const elemWithCategoryPath = e.target.closest("[data-category-path]");

    if (!elemWithCategoryPath) return;

    const categoryPath =
      elemWithCategoryPath.getAttribute("data-category-path");

    todoList.pathUpdate(categoryPath);

    PubSub.publish(EVENTS.NAV_RENDER, EVENTS.SUBCATEGORY);
  }

  function toggleDisplayOfCompletedTask() {
    listOfCompletedTaskSection.classList.toggle("hide");
  }

  // Initial Rendering

  function MyProjectSection() {
    const myProject = document.createElement("div");
    myProject.innerHTML = `
    <p class="categoryTitleSection"><span>#</span> <span class="categoryTitle"></span> <span class="numberOfTaskInCategory"></span>
    `;

    const template = () => myProject.cloneNode(true);

    return { template };
  }

  const myProject = MyProjectSection();

  const lenOfIncompleteTask = () =>
    taskForAdjustment.filter((taskObj) => !taskObj.status).length;

  const displayCategoryElement = (myProjectObj) => {
    const element = myProject.template();

    element.classList.add("cursor_pointer");

    element.setAttribute(
      "data-category-path",
      `${myProjectObj[keys.categoryPath]}`
    );

    const categoryTitle = element.querySelector(".categoryTitle");
    const numberOfTaskInCategory = element.querySelector(
      ".numberOfTaskInCategory"
    );

    categoryTitle.textContent = myProjectObj[keys.projectTitle];

    numberOfTaskInCategory.textContent = lenOfIncompleteTask();

    myProjectCategorySection.append(element);
  };

  const getCategoryInformation = (category) => {
    if (Array.isArray(category[keys.sections])) {
      todoList.filter(
        category[keys.sections],
        undefined,
        undefined,
        pushTaskToArrToGetLength
      );
    }

    displayCategoryElement(category);
    taskForAdjustment.splice(0);
  };

  const handleProjectCategory = (todoListObj) => {
    taskForAdjustment.splice(0);
    todoListObj[keys.myProject].forEach(getCategoryInformation);
  };

  const pushTaskToArrToGetLength = (task) => {
    taskForAdjustment.push(task);
  };

  const resetCategory = () => {
    taskForAdjustment.splice(0);
    myProjectCategorySection.innerHTML = "";
    listOfCompletedTaskSection.innerHTML = "";
  };

  const displayCompletedTask = (task) => {
    listOfCompletedTaskSection.append(task);
  };

  const handleDisplayCompletedTask = () => {
    taskForAdjustment
      .filter((taskObj) => {
        return taskObj.status;
      })
      .sort(todoList.sortPriority)
      .forEach((taskObj) => {
        DOMtask.set(taskObj, displayCompletedTask);
      });
  };

  const setNumOfTaskInInbox = () => {
    numberOfInbox.textContent = lenOfIncompleteTask();
  };

  const pushTaskToArrForAdjustment = (task) => {
    taskForAdjustment.push(task);
  };

  const handleCategoryTask = () => {
    resetCategory();
    const todoListObj = storage.get(keys.todo_list);

    for (const root in todoListObj) {
      todoList.filter(
        todoListObj[root],
        undefined,
        undefined,
        pushTaskToArrForAdjustment
      );

      if (root === keys.inbox) setNumOfTaskInInbox();
    }

    handleDisplayCompletedTask();

    handleProjectCategory(todoListObj);
  };

  const render = () => {
    navContentHolder.append(categoryContent);
    handleCategoryTask();
  };

  inboxSection.addEventListener("click", handleNavigation);

  myProjectCategorySection.addEventListener("click", handleNavigation);

  iconSaveCategory.addEventListener("click", addMyProject);

  arrowViewCompetedTask.addEventListener("click", toggleDisplayOfCompletedTask);

  myProjectsEllipse.addEventListener("click", toggleDisplayMyProjectOption);

  projectOptions.addEventListener("click", handleMyProjectOptionAction);

  categoryContent.addEventListener("click", (e) => Modal.close(datasets, e));

  return { init };
}

export default Category;
