import PubSub from "pubsub-js";
import EVENTS from "../events";
import keys from "../constant";
import storage from "../storage";
import todoList from "../todo_list";
import { MyProject } from "../category";

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
        <div class="inbox_filter_completed_section">
            <p class="icon_and_title" data-category="INBOX"><span>📥</span> <span class="title" data-category-path="${keys.inbox}">${keys.inbox}</span> <span class="number_of_inbox"></span></p>
        </div>
        
        <div class="project_title_and_myProjectCategorySection">
            <div class="project_title_and_ellipse">
              <p>My Projects</p><p class="cursor_pointer" data-display="myProjectOption">&vellip;</p>

              <div class="projectOptions close">
                <div data-add="${keys.myProject}"># Add Project</div>
                
                <div class="enterCategorySection hide">
                  <input name="enterCategory" class="enterCategory" data-avoid="true" placeholder="Enter Category Name"/>
                  <span class="iconSaveCategory cursor_pointer">✅</span>
                </div>
              </div>
            </div>
            <div class="myProjectCategorySection" data-category="MY_PROJECT"></div>
        </div>
    </div>
  `;

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

  const numOfTask = [];

  const categoryHolder = categoryContent.querySelector(
    ".category_section_holder"
  );

  const showEnterCategorySection = () => {
    enterCategorySection.classList.toggle("hide");
  };

  // come back here later to make the handling of section closing and hiding more concisely
  function displayMyProjectOption(e) {
    const avoid = e.target.dataset.avoid;

    if (avoid) return;

    const display = e.target.dataset.display;

    const add = e.target.dataset.add;
    if (add) {
      iconSaveCategory.setAttribute("data-category-type", add);
      showEnterCategorySection();
      return;
    }

    if (display) {
      projectOptions.classList.toggle("close");
    } else {
      projectOptions.classList.add("close");
    }
  }

  function addMyProject() {
    todoList.pathUpdate([keys.myProject]);
    todoList.addMyProject({ title: enterCategory.value });
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

  const displayCategoryElement = (myProjectObj) => {
    const element = myProject.template();

    element.setAttribute(
      "data-category-path",
      `${myProjectObj[keys.categoryPath]}`
    );

    const categoryTitle = element.querySelector(".categoryTitle");
    const numberOfTaskInCategory = element.querySelector(
      ".numberOfTaskInCategory"
    );

    categoryTitle.textContent = myProjectObj[keys.projectTitle];
    numberOfTaskInCategory.textContent = numOfTask.length;

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
    numOfTask.splice(0);
  };

  const handleProjectCategory = (todoListObj) => {
    numOfTask.splice(0);
    todoListObj[keys.myProject].forEach(getCategoryInformation);
  };

  const setNumOfTaskInInbox = () => {
    numberOfInbox.textContent = numOfTask.length;
  };

  const pushTaskToArrToGetLength = () => {
    numOfTask.push(true);
  };

  const resetCategory = () => {
    numOfTask.splice(0);
    myProjectCategorySection.innerHTML = "";
  };

  const handleCategoryTask = () => {
    resetCategory();
    const todoListObj = storage.get(keys.todo_list);
    todoList.filter(
      todoListObj[keys.inbox],
      undefined,
      undefined,
      pushTaskToArrToGetLength
    );
    setNumOfTaskInInbox();

    handleProjectCategory(todoListObj);
  };

  const render = () => {
    navContentHolder.append(categoryContent);
    handleCategoryTask();
  };

  categoryHolder.addEventListener("click", handleNavigation);

  iconSaveCategory.addEventListener("click", addMyProject);

  categoryContent.addEventListener("click", displayMyProjectOption);

  return { init };
}

export default Category;
