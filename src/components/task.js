import {
  categoryReference,
  path,
  taskAndCategoryHandler
} from "../config/constant";
import EVENTS from "../config/EVENTS";

const DATA_CAT_REF = "data-category-reference";

const CreateTaskTemplate = () => {
  const task = document.createElement("div");
  task.classList.add("task");
  task.setAttribute("data-task-action", "view");

  task.innerHTML = `
    <input
      class="mark-status"
      data-task-action="mark"
      type="checkbox"
      data-priority
    />

    <div class="title-and-date-section">
      <div class="title"></div>
      <p class="description"></p>
    </div>

    <div class="task-right-side">
      <div class="more_options_section">
        <div>
          <span class="delete_task cursor_pointer" data-task-action="delete"
            >Delete</span
          >
        </div>
      </div>

      <p class="categoryTitle"></p>
    </div>
  `;

  const getTaskTemplate = () => {
    const cloneTask = task.cloneNode(true);

    cloneTask.addEventListener("click", handleTaskAction);

    return cloneTask;
  };

  return { getTaskTemplate };
};

const getClosestElement = (target, value) => {
  return target.closest(`[${value}]`);
};

const TaskAction = {
  delete: (target) => {
    taskAndCategoryHandler.deleteTask();
    const taskSection = target.closest(".task");
    taskSection.remove();
  },
  view: (target) => {
    const task = taskAndCategoryHandler.getTask();
    const taskSection = target.closest(`[${DATA_CAT_REF}]`);

    categoryReference.update(path.constructCategoryReference(taskSection));

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.VIEW_TASK_DIALOG, {
      task,
      taskSection
    });
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

function handleTaskAction(e) {
  const taskDataset = e.target.dataset;

  if (!taskDataset.taskAction) return;

  const taskSection = e.target.closest(`[${DATA_CAT_REF}]`);

  const referenceArrayFormat = path.constructCategoryReference(taskSection);

  categoryReference.update(referenceArrayFormat);

  TaskAction[taskDataset.taskAction](e.target);
}

PubSub.subscribe(EVENTS.UI.MARK, markTask);

const taskTemplate = CreateTaskTemplate();

const setTaskValue = (category, callback) => {
  const task = taskTemplate.getTaskTemplate();

  task.setAttribute(DATA_CAT_REF, category.category);

  const priority = task.querySelector("[data-priority]");
  const title = task.querySelector(".title");
  const description = task.querySelector(".description");
  const categoryTitle = task.querySelector(".categoryTitle");

  priority.setAttribute("data-priority", category.priority);

  title.textContent = category.title || category.subtitle;

  categoryTitle.textContent = path.generateCategory(task);

  description.textContent = category.description;

  callback(task, category);
};

export { setTaskValue };
