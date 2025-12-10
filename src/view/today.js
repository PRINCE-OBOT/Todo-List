import EVENTS from "../config/EVENTS";
import { category } from "../Todo-List/todo-list";
import { CATEGORIES, filterTaskBy } from "../config/constant";
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

  const createTodayTask = (category) => {
    if (!isToday(category.date)) return;

    const task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
    <input class="mark-status" type="checkbox" data-priority="${category.priority}"/>
    <div>
      <div class="title">${category.title}</div>
    </div>
    <p class="category">${category.formatCategory}</p>
    `;

    todayTaskSection.append(task);
  };

  const createOverdueTask = (category) => {
    if (!isBefore(new Date(category.date), today)) return;

    const task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
    <input class="mark-status" type="checkbox" data-priority="${category.priority}"/>
    <div>
      <div class="title">${category.title}</div>
      <p class="date">${category.date}</p>
    </div>
    <p class="category">${category.formatCategory}</p>
    `;

    overdueTaskSection.append(task);
  };

  const filterTodayTask = () => {
    const Categories = category.getCategories();

    for (let key in Categories) {
      filterTaskBy(Categories[key], createTodayTask);
    }
  };

  const filterOverdueTask = () => {
    const Categories = category.getCategories();

    for (let key in Categories) {
      filterTaskBy(Categories[key], createOverdueTask);
    }
  };

  const render = () => {
    main.append(div);
    filterTodayTask();
    filterOverdueTask();
  };

  const removeToday = () => {
    div.remove();
  };

  return { init };
}

export default Today;
