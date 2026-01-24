import { startOfDay, isToday, isBefore } from "date-fns";
import { DOMtask } from "./task";
import keys from "../constant";
import EVENTS from "../events";
import PubSub from "pubsub-js";
import storage from "../storage";
import todoList from "../todo_list";

function Today(navContentHolder) {
  const init = () => {
    PubSub.subscribe(EVENTS.TODAY, render);
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

      <div class="btn_add_task cursor_pointer" >&#10011; Add Task</div>
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

  const taskToBeAdjusted = [];

  const appendTodayTask = (taskElem) => {
    todayTaskSection.append(taskElem);
  };

  const appendOverdueTask = (taskElem, taskObj) => {
    const p = document.createElement("p");

    p.classList.add("task_overdue_date");
    p.textContent = new Date(taskObj.dueDate).toDateString();

    const titleAndDateSection = taskElem.querySelector(
      ".title-and-date-section"
    );

    titleAndDateSection.append(p);

    overdueTaskSection.append(taskElem);
  };

  const splitTodayAndOverdueTask = (taskObj) => {
    if (taskObj.status) return;
    else if (isToday(taskObj.dueDate)) DOMtask.set(taskObj, appendTodayTask);
    else if (isBefore(new Date(taskObj.dueDate), today))
      DOMtask.set(taskObj, appendOverdueTask);
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

    const todoListObj = storage.get(keys.todo_list);

    for (const root in todoListObj) {
      todoList.filter(
        todoListObj[root],
        undefined,
        undefined,
        pushTaskToArrForAdjustment
      );
    }

    taskToBeAdjusted.sort(todoList.sortPriority);
    taskToBeAdjusted.forEach(splitTodayAndOverdueTask);

    today_and_overdue_task.textContent = taskToBeAdjusted.filter(
      (taskObj) => !taskObj.status
    ).length;
  };

  function handleAddTask() {
    todoList.pathDefault();

    PubSub.publish(EVENTS.SHOW_TASK_DIALOG);
  }

  const render = () => {
    navContentHolder.append(todayContent);
    handleTodayAndOverdueTask();
  };

  btnAddTask.addEventListener("click", handleAddTask);

  return { init };
}

export default Today;
