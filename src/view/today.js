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

  const todayTask = [];

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
  todayContent.addEventListener("click", showMoreOptions);

  const TaskAction = {
    delete: (taskSection) => {
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DELETE);
      taskSection.remove();
    },
    view: () => {
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.GET_TASK);
    },
    mark: (taskSection) => {
      const markStatus = taskSection.querySelector(".mark-status");

      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.EDIT, {
        status: markStatus.checked
      });

      taskSection.textContent = "Task ";

      taskSection.textContent += markStatus.checked
        ? "Completed"
        : "Not completed";

      setTimeout(() => taskSection.classList.add("task_mark"), 1000);
      
      setTimeout(() => taskSection.remove(), 1299);
    }
  };

  const getClosestElement = (target, value) => {
    return target.closest(value);
  };

  function showMoreOptions(e) {
    const moreOption = e.target.dataset.moreOption;

    if (!moreOption) return;

    const taskSection = getClosestElement(
      e.target,
      "[data-category-reference]"
    );

    const moreOptionsAction = taskSection.querySelector(".more_options_action");

    moreOptionsAction.classList.toggle("hide");
  }

  function handleTaskAction(e) {
    const taskDataset = e.target.dataset;

    if (!taskDataset.taskAction) return;

    const taskSection = getClosestElement(
      e.target,
      "[data-category-reference]"
    );

    const categoryReference = taskSection.getAttribute(
      "data-category-reference"
    );

    const categoryPath = categoryReference
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, categoryPath);

    TaskAction[taskDataset.taskAction](taskSection);
  }

  const appendTodayTask = (task) => {
    todayTaskSection.append(task);
  };

  const appendOverdueTask = (category, task, titleAndDateSection) => {
    const p = document.createElement("p");

    p.classList.add("task_overdue_date");
    p.textContent = new Date(category.date).toDateString();

    titleAndDateSection.append(p);

    overdueTaskSection.append(task);
  };

  const handleSortOfTask = (category, categoryTitles) => {
    category.categoryTitleFormatted = categoryTitles;
    todayTask.push(category);
  };

  const CreateTaskTemplate = () => {
    const task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
      <input class="mark-status" data-task-action="mark" type="checkbox" data-priority />
      
      <div class="title-and-date-section">
        <div class="title"></div>
        <p class="description"></p>
      </div>
      
      <div class="task-right-side">
        <div class="more_options_section">
          
          <div class="more_options_action hide">
            <span class="delete_task" data-task-action="delete">Delete</span>
            <span class="view_task" data-task-action="view">View</span>
          </div>
          
          <div class="show_more_options" data-more-option="toggle">
            &vellip;
          </div>
        </div>

        <p class="categoryTitle"></p>
      </div>
    `;

    const getTaskTemplate = () => task.cloneNode(true);

    return { getTaskTemplate };
  };

  const taskTemplate = CreateTaskTemplate();

  const setTaskValue = (category) => {
    const task = taskTemplate.getTaskTemplate();
    task.setAttribute("data-category-reference", category.category);

    const priority = task.querySelector("[data-priority]");
    const title = task.querySelector(".title");
    const description = task.querySelector(".description");
    const categoryTitle = task.querySelector(".categoryTitle");
    const titleAndDateSection = task.querySelector(".title-and-date-section");

    priority.setAttribute("data-priority", category.priority);

    title.textContent = category.title;
    categoryTitle.textContent = category.categoryTitleFormatted;
    description.textContent = category.description;

    if (isBefore(new Date(category.date), today))
      appendOverdueTask(category, task, titleAndDateSection);
    if (isToday(category.date)) appendTodayTask(task);
  };

  const sortTaskBaseOnPriority = (currentTask, nextTask) =>
    currentTask.priority - nextTask.priority;

  const handleGetTask = () => {
    todayTask.splice(0);

    const Categories = category.getCategories();

    for (let categoryTitle in Categories) {
      getTasks(
        Categories[categoryTitle],
        handleSortOfTask,
        Context.NEW,
        categoryTitle
      );
    }

    todayTask.sort(sortTaskBaseOnPriority);
    todayTask.forEach(setTaskValue);
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
