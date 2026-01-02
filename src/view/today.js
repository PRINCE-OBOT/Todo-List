import { setTaskValue } from "../components/task";
import EVENTS from "../config/EVENTS";
import {
  taskAndCategoryHandler,
  categoryReference,
  filterTasks,
  sortTaskBaseOnPriority
} from "../config/constant";
import { startOfDay, isToday, isBefore } from "date-fns";
import PubSub from "pubsub-js";

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
      <p><span class="today_and_overdue_task"></span> <span>tasks</span></p>
    </div>

    <div>
      <div>
        <h3 data-date="today">${todayDate}</h3>
        <br />
        <div data-tasks-section="today"></div>
      </div>

      <div>
        <h3 class="overdue-title">Overdue</h3>
        <br />
        <div data-tasks-section="overdue"></div>
      </div>

      <div class="btn_add_task cursor_pointer">&#10011; Add Task</div>
    </div>
  `;

  const todayTaskSection = todayContent.querySelector(
    '[data-tasks-section="today"]'
  );
  const overdueTaskSection = todayContent.querySelector(
    '[data-tasks-section="overdue"]'
  );
  const today_and_overdue_task = todayContent.querySelector(
    ".today_and_overdue_task"
  );

  const btnAddTask = todayContent.querySelector(".btn_add_task");

  btnAddTask.addEventListener("click", addTask);

  const taskToBeAdjusted = [];

  function addTask() {
    categoryReference.update(categoryReference.getDefault());
    console.log(categoryReference.getDefault());

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD_TASK_DIALOG);
  }

  const appendTodayTask = (task) => {
    todayTaskSection.append(task);
  };

  const appendOverdueTask = (task, category) => {
    const p = document.createElement("p");

    p.classList.add("task_overdue_date");
    p.textContent = new Date(category.date).toDateString();

    const titleAndDateSection = task.querySelector(".title-and-date-section");

    titleAndDateSection.append(p);

    overdueTaskSection.append(task);
  };

  const handleDisplayTaskInTodayAndOverSection = (task) => {
    if (isBefore(new Date(task.date), today))
      setTaskValue(task, appendOverdueTask);
    if (isToday(task.date)) setTaskValue(task, appendTodayTask);
  };

  const pushTaskToArrForAdjustment = (task) => {
    taskToBeAdjusted.push(task);
  };

  const resetTodayAndOverdueTask = () => {
    overdueTaskSection.innerHTML = "";
    todayTaskSection.innerHTML = "";

    taskToBeAdjusted.splice(0);
  };

  const handleTodayAndOverdueTask = () => {
    resetTodayAndOverdueTask();

    console.log(taskAndCategoryHandler.getCategories());

    for (let key in taskAndCategoryHandler.getCategories()) {
      filterTasks(
        taskAndCategoryHandler.getCategories()[key],
        undefined,
        undefined,
        pushTaskToArrForAdjustment
      );
    }

    taskToBeAdjusted.sort(sortTaskBaseOnPriority);
    taskToBeAdjusted.forEach(handleDisplayTaskInTodayAndOverSection);

    today_and_overdue_task.textContent = taskToBeAdjusted.length;
  };

  const render = () => {
    main.append(todayContent);
    handleTodayAndOverdueTask();
  };

  const removeToday = () => {
    todayContent.remove();
  };

  return { init };
}

export default Today;
