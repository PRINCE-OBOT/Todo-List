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

  let categoryTitles = ''

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
    const task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
    <input class="mark-status" type="checkbox" data-priority="${
      category.priority
    }"/>
    <div>
      <div class="title">${category.title}</div>
    </div>
    <p class="category">${categoryTitles}</p>
    `;

    todayTaskSection.append(task);
  };

  const createOverdueTask = (category) => {
    if (!isBefore(new Date(category.date), today)) return;

    const task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
    <input class="mark-status" type="checkbox" data-priority="${
      category.priority
    }"/>
    <div>
      <div class="title">${category.title}</div>
      <p class="date">${category.date}</p>
    </div>
    <p class="category">${categoryTitles}</p>
    `;

    overdueTaskSection.append(task);
  };

  const handleFilterTask = (category, categoryTitle) => {
    categoryTitles = categoryTitle;
    if (isBefore(new Date(category.date), today)) createOverdueTask(category);
    if (isToday(category.date)) createTodayTask(category);
  };

  const handleGetTask = () => {
    const Categories = category.getCategories();

    for (let key in Categories) {
      categoryTitles = key

      getTasks(Categories[key], handleFilterTask, Context.NEW, categoryTitles);
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
