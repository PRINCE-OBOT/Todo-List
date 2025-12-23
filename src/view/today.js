import EVENTS from "../config/EVENTS";
import { category } from "../Todo-List/todo-list";
import { getTasks, Context, taskTemplate } from "../config/constant";
import { startOfDay, isToday, isBefore } from "date-fns";
import PubSub from "pubsub-js";

function Today(main) {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.TODAY, render);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TODAY, removeToday);

    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.SEND_LABEL, sendLabels);

    PubSub.subscribe(EVENTS.UI.MARK, markTask);
  };

  const todayDate = new Date().toDateString();
  const today = startOfDay(new Date());

  const todayAndOverdueTask = [];
  const labels = [];
  const DATA_CAT_REF = "data-category-reference";

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
      <br>
      <div data-tasks-section="today"></div>
      </div>

      <div>
        <h3 class="overdue-title">
          Overdue
        </h3>
        <br>
        <div data-tasks-section="overdue"></div>
      </div>

      <div class="btn_add_task">
        &#10011; Add Task
      </div>

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

  todayContent.addEventListener("click", handleTaskAction);
  todayContent.addEventListener("click", showMoreOptions);
  btnAddTask.addEventListener("click", addTask);

  const DEFAULT_REFERENCE = ["Inbox", 0];

  function addTask() {
    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.REFERENCE, DEFAULT_REFERENCE);

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD_TASK_DIALOG);
  }

  const getClosestElement = (target, value) => {
    return target.closest(`[${value}]`);
  };

  const getAttributeFromClosestParent = (target, value) => {
    const closestParent = getClosestElement(target, value);
    const attribute = closestParent.getAttribute(value);
    return attribute;
  };

  const TaskAction = {
    delete: (target) => {
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DELETE);

      const taskSection = getClosestElement(target);

      taskSection.remove();
    },
    view: (target) => {
      const taskSection = getClosestElement(target, DATA_CAT_REF);
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.GET_TASK, taskSection);
    },
    mark: (target) => {
      markTask(null, { target });
    }
  };

  const markTask = (msg, { target, taskSection }) => {
    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MARK, target.checked);

    if (!msg) {
      taskSection = getClosestElement(target, DATA_CAT_REF);
    }

    taskSection.textContent = "Task ";

    taskSection.textContent += target.checked ? "Completed" : "Not completed";

    setTimeout(() => taskSection.classList.add("task_mark"), 1000);

    setTimeout(() => taskSection.remove(), 1290);
  };

  function showMoreOptions(e) {
    const moreOption = e.target.dataset.moreOption;

    if (!moreOption) return;

    const taskSection = getClosestElement(e.target, "data-category-reference");

    const moreOptionsAction = taskSection.querySelector(".more_options_action");

    moreOptionsAction.classList.toggle("hide");
  }

  function handleTaskAction(e) {
    const taskDataset = e.target.dataset;

    if (!taskDataset.taskAction) return;

    const attribute = getAttributeFromClosestParent(e.target, DATA_CAT_REF);

    const categoryPath = attribute
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));

    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.REFERENCE, categoryPath);

    TaskAction[taskDataset.taskAction](e.target);
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
    todayAndOverdueTask.push(category);
  };

  

  const addLabelValue = (category) => {
    if (!labels.includes(category.label)) {
      labels.push(category.label);
    }
  };

  const setTaskValue = (category) => {
    const task = taskTemplate.getTaskTemplate();
    task.setAttribute(DATA_CAT_REF, category.category);

    const priority = task.querySelector("[data-priority]");
    const title = task.querySelector(".title");
    const description = task.querySelector(".description");
    const categoryTitle = task.querySelector(".categoryTitle");
    const titleAndDateSection = task.querySelector(".title-and-date-section");

    priority.setAttribute("data-priority", category.priority);

    title.textContent = category.title;
    categoryTitle.textContent = category.categoryTitleFormatted;
    description.textContent = category.description;

    addLabelValue(category);

    if (isBefore(new Date(category.date), today))
      appendOverdueTask(category, task, titleAndDateSection);
    if (isToday(category.date)) appendTodayTask(task);
  };

  const sortTaskBaseOnPriority = (currentTask, nextTask) =>
    currentTask.priority - nextTask.priority;

  const handleGetTask = () => {
    overdueTaskSection.innerHTML = "";
    todayTaskSection.innerHTML = "";

    todayAndOverdueTask.splice(0);
    labels.splice(0);

    const Categories = category.getCategories();

    for (let categoryTitle in Categories) {
      getTasks(
        Categories[categoryTitle],
        handleSortOfTask,
        Context.NEW,
        categoryTitle
      );
    }

    todayAndOverdueTask.sort(sortTaskBaseOnPriority);
    todayAndOverdueTask.forEach(setTaskValue);
    today_and_overdue_task.textContent = todayAndOverdueTask.length;
  };

  const sendLabels = () => {
    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.LABEL_SENT, labels);
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
