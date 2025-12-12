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

  const div = document.createElement("div");
  div.classList.add("today_page");

  div.innerHTML = `
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

  const todayTaskSection = div.querySelector('[data-tasks-section="today"]');
  const overdueTaskSection = div.querySelector(
    '[data-tasks-section="overdue"]'
  );

  overdueTaskSection.addEventListener("click", handleTaskAction);

  const TaskAction = {
    delete: () => PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DELETE)
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
      .map((index, i) => (Number.isNaN(+index) ? index : +index));


    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, result);

    TaskAction[taskDataset.taskAction]();
  }

  const createTodayTask = (category, categoryTitles) => {
    const task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("data-category-reference", category.category);

    task.innerHTML = `
    <input class="mark-status" type="checkbox" data-priority="${category.priority}"/>
    <div>
    <div class="title">${category.title}</div>
    </div>
    <div>
      <div class="more-options">&vellip;</div>
      <p class="category">${categoryTitles}</p>
    </div>
    `;

    todayTaskSection.append(task);
  };

  const createOverdueTask = (category, categoryTitles) => {
    if (!isBefore(new Date(category.date), today)) return;

    const task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("data-category-reference", category.category);

    task.innerHTML = `
      <input
        class="mark-status"
        type="checkbox"
        data-priority="${category.priority}"
      />
      <div>
        <div class="title">${category.title}</div>
        <p class="date">${category.date}</p>
      </div>
      <div>
        <div class="more_options_section">
          <div class="more_options_action">
            <span class="delete_task" data-task-action="delete">Delete</span>
            <span class="edit_task" data-task-action="edit">Edit</span>
          </div>
          <div class="show_more_options">&vellip;</div>
        </div>
        <p class="category">${categoryTitles}</p>
      </div>
    `;

    overdueTaskSection.append(task);
  };

  const handleFilterTask = (category, categoryTitles) => {
    if (isBefore(new Date(category.date), today))
      createOverdueTask(category, categoryTitles);
    if (isToday(category.date)) createTodayTask(category, categoryTitles);
  };

  const handleGetTask = () => {
    const Categories = category.getCategories();

    for (let categoryTitle in Categories) {
      getTasks(
        Categories[categoryTitle],
        handleFilterTask,
        Context.NEW,
        categoryTitle
      );
    }
  };

  const render = () => {
    main.append(div);
    handleGetTask();
  };

  const removeToday = () => {
    div.remove();
  };

  return { init };
}

export default Today;
