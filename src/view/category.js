import { setTaskValue } from "../components/task";
import EVENTS from "../config/EVENTS";
import {
  taskAndCategoryHandler,
  filterTasks,
  sortTaskBaseOnPriority,
  path,
  categoryReference
} from "../config/constant";
import PubSub from "pubsub-js";
import MainNavController from "./mainNavController";

function CategoryPage(mainNavigation, changeViewHolder) {
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
        <div class="inbox_filter_completed_section">
            <p class="icon_and_title" data-category="INBOX"><span>📥</span> <span>Inbox</span> <span class="number_of_inbox"></span></p>
        </div>
        
        <div>
            <p>My Projects</p>
            <div class="myProjectCategorySection" data-category="MY_PROJECT"></div>
        </div>
    </div>
  `;

  const numberOfInbox = categoryContent.querySelector(".number_of_inbox");
  const myProjectCategorySection = categoryContent.querySelector(
    ".myProjectCategorySection"
  );

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

  const render = () => {
    changeViewHolder.append(categoryContent);
    handleCategoryTask();
  };

  const removeCategoryView = () => {
    categoryContent.remove();
  };

  function handleCategoryAction() {}

  const categorySectionHolder = categoryContent.querySelector(
    ".category_section_holder"
  );

  const mainNavController = MainNavController(mainNavigation, changeViewHolder);

  function handleNavigation(e) {
    const category = e.target.closest("[data-category]");

    if (!category) return;

    const categoryTitle = category.getAttribute("data-category");

    const categoryIndex = e.target.dataset.categoryIndex;

    if (categoryIndex === undefined) {
      PubSub.publishSync(EVENTS.PAGE.LOAD[categoryTitle], {
        categoryTitle
      });
    } else {
      PubSub.publishSync(EVENTS.PAGE.LOAD[categoryTitle], { categoryIndex });
    }

    mainNavController.mainView({
      target: { dataset: { changeMainView: "SUBSECTION" } }
    });
  }

  categorySectionHolder.addEventListener("click", handleNavigation);

  return { init };
}

export default CategoryPage;

/* 
How to reference a category 
todo.categoryReference.update(['My_Project'])

How to add a category
todo.taskAndCategoryHandler.addCategory({ categoryTitle: 'holiday', sections: [[]]})

 */
