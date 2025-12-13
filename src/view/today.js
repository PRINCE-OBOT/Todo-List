import EVENTS from "../config/EVENTS";
import { category } from "../Todo-List/todo-list";
import { getTasks, Context } from "../config/constant";
import isBefore from "date-fns/isBefore";
import startOfDay from "date-fns/startOfDay";
import isToday from "date-fns/isToday";

function Today(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.TODAY, render);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TODAY, removeToday);
  };

  const todayDate = new Date().toDateString();
  const today = startOfDay(new Date());

  const todayContent = document.createElement("div");
  todayContent.classList.add("today_page");

  todayContent.innerHTML = `
    <div>
      <h2>Today</h2>
      <p>
        <span data-number-of="today-ahead-task"></span> <span>tasks</span>
      </p>
    </div>

    <div data-tasks="today-ahead">
      <div data-tasks-section="today">
        <h3 data-date="today">${todayDate}</h3>
        <div data-tasks-section="today"></div>
      </div>

      <div data-tasks-section="overdue">
        <h3 class="overdue-title">Overdue<span data-number-of="overdue-task"></span></h3>
        <div data-tasks="overdue"></div>
      </div>
    </div>
  `;

  const todayTaskSection = todayContent.querySelector(
    '[data-tasks-section="today"]'
  );
  const overdueTaskSection = todayContent.querySelector(
    '[data-tasks-section="overdue"]'
  );

  todayContent.addEventListener("click", handleTaskAction);

  const TaskAction = {
    delete: (taskSection) => {
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DELETE);
      taskSection.remove();
    },
    showMoreAction: (taskSection) => {
      const moreOptionsAction = taskSection.querySelector(
        ".more_options_action"
      );
      moreOptionsAction.classList.toggle("hide");
    },
    view: () => {
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.GET_TASK);
    }
  };

  function handleTaskAction(e) {
    const taskDataset = e.target.dataset;

    if (!taskDataset.taskAction) return;

    const taskSection = e.target.closest("[data-category-reference]");

    const categoryReference = taskSection.getAttribute(
      "data-category-reference"
    );

    const result = categoryReference
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, result);

    TaskAction[taskDataset.taskAction](taskSection);
  }

  const appendTodayTask = (task) => {
    todayTaskSection.append(task);
  };

  const appendOverdueTask = (category, task, titleAndDateSection) => {
    const p = document.createElement("p");
    p.textContent = category.date;

    titleAndDateSection.append(p);

    overdueTaskSection.append(task);
  };

  const createTaskElement = (category, categoryTitles) => {
    const task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("data-category-reference", category.category);

    category.categoryTitleFormatted = categoryTitles

    task.innerHTML = `
      <input
        class="mark-status"
        type="checkbox"
        data-priority="${category.priority}"
      />
      <div class="title-and-date-section">
        <div class="title">${category.title}</div>
      </div>
      <div>
        <div class="more_options_section">
          <div class="more_options_action hide">
            <span class="delete_task" data-task-action="delete">Delete</span>
            <span class="view_task" data-task-action="view">View</span>
          </div>
          <div class="show_more_options" data-task-action="showMoreAction">&vellip;</div>
        </div>
        <p class="category">${categoryTitles}</p>
      </div>
    `;

    const titleAndDateSection = task.querySelector(".title-and-date-section");

    if (isBefore(new Date(category.date), today))
      appendOverdueTask(category, task, titleAndDateSection);
    if (isToday(category.date)) appendTodayTask(task);
  };

  const handleGetTask = () => {
    const Categories = category.getCategories();

    for (let categoryTitle in Categories) {
      getTasks(
        Categories[categoryTitle],
        createTaskElement,
        Context.NEW,
        categoryTitle
      );
    }
  };

  const render = () => {
    main.append(todayContent);
    handleGetTask();
  };

  const removeToday = () => {
    todayContent.remove();
  };

  return { init };
}

export default Today;
