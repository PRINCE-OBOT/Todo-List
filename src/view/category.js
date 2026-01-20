import EVENTS from "../config/EVENTS";
import {
  taskAndCategoryHandler,
  filterTasks,
  categoryReference,
  categoryTypeHandler
} from "../config/constant";
import PubSub from "pubsub-js";
import mainNavController from "./mainNavController";

function CategoryPage(_, changeViewHolder) {
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
        <div class="inbox_section">
            <p class="icon_and_title" data-category="INBOX"><span>📥</span> <span>Inbox</span> <span class="number_of_inbox"></span></p>
        </div>
        
        <div class="project_title_and_myProjectCategorySection">
            <div class="project_title_and_ellipse">
              <p>My Projects</p><p class="cursor_pointer" data-display="myProjectOption">&vellip;</p>

              <div class="projectOptions close">
                <div data-add="category"># Add Project</div>
                
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

  const setNumberOfInbox = (inboxArr) => {
    numberOfInbox.textContent = inboxArr.length;
  };

  function CategoryElement() {
    const categoryElement = document.createElement("div");

    categoryElement.innerHTML = `
    <p class="categoryTitleSection"><span>#</span> <span class="categoryTitle"></span> <span class="numberOfTaskInCategory"></span>
    `;

    const template = () => {
      const cloneCategory = categoryElement.cloneNode(true);

      cloneCategory.addEventListener("click", handleCategoryAction);

      return cloneCategory;
    };

    return { template };
  }

  const categoryElement = CategoryElement();

  const displayCategoryElement = (title, index, count) => {
    const element = categoryElement.template();

    element.setAttribute("data-category-index", index);

    const categoryTitle = element.querySelector(".categoryTitle");
    const numberOfTaskInCategory = element.querySelector(
      ".numberOfTaskInCategory"
    );

    categoryTitle.textContent = title;
    numberOfTaskInCategory.textContent = count;

    myProjectCategorySection.append(element);
  };

  const inboxCategoryArr = [];

  const resetCategory = () => {
    inboxCategoryArr.splice(0);
    myProjectCategorySection.innerHTML = "";
  };

  const myProjectCategoryArr = [];

  const pushTaskToMyProjectCategoryArr = (task) => {
    myProjectCategoryArr.push(task);
  };

  const getCategoryInformation = (category, index) => {
    if (Array.isArray(category.sections)) {
      filterTasks(
        category.sections,
        undefined,
        undefined,
        pushTaskToMyProjectCategoryArr
      );
    }

    displayCategoryElement(
      category.categoryTitle,
      index,
      myProjectCategoryArr.length
    );
    myProjectCategoryArr.splice(0);
  };

  const handleProjectCategory = () => {
    const categoryInMyProject =
      taskAndCategoryHandler.getCategories().My_Project;

    categoryInMyProject.forEach(getCategoryInformation);
  };

  const pushTaskToInboxArr = (task) => {
    inboxCategoryArr.push(task);
  };

  const handleCategoryTask = () => {
    resetCategory();

    const categories = taskAndCategoryHandler.getCategories();

    filterTasks(categories.Inbox, undefined, undefined, pushTaskToInboxArr);

    setNumberOfInbox(inboxCategoryArr);

    handleProjectCategory();
  };

  const render = (msg, {}) => {
    changeViewHolder.append(categoryContent);
    handleCategoryTask();
  };

  const removeCategoryView = (_, {}) => {
    categoryContent.remove();
  };

  function handleCategoryAction() {}

  const categorySectionHolder = categoryContent.querySelector(
    ".category_section_holder"
  );

  function handleNavigation(e) {
    const category = e.target.closest("[data-category]");

    if (!category) return;

    const categoryTitle = category.getAttribute("data-category");

    const categoryIndexElem = e.target.closest("[data-category-index]");

    let categoryIndex;

    if (categoryIndexElem) {
      categoryIndex = +categoryIndexElem.getAttribute("data-category-index");
    }

    if (categoryTitle === "MY_PROJECT") {
      if (categoryIndex === undefined) return;
    }

    mainNavController.mainView({
      target: {
        dataset: { changeMainView: categoryTitle, categoryIndex }
      }
    });
  }

  const showEnterCategorySection = () => {
    enterCategorySection.classList.toggle("hide");
  };

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

  function saveCategory(e) {
    const categoryType = e.target.dataset.categoryType;

    if (!categoryType) return;

    categoryTypeHandler[categoryType](enterCategory.value);

    enterCategory.value = "";

    render(_, {});
  }

  categorySectionHolder.addEventListener("click", handleNavigation);

  iconSaveCategory.addEventListener("click", saveCategory);

  categoryContent.addEventListener("click", displayMyProjectOption);

  return { init };
}

export default CategoryPage;

/* 
How to reference a category 
todo.categoryReference.update(['My_Project'])

How to add a category
todo.taskAndCategoryHandler.addCategory({ categoryTitle: 'holiday', sections: [[]]})

 */

// Next to add is UI for DELETING CATEGORY, section, make adding of task button in the category and in inside inbox
