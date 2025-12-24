import EVENTS from "../config/EVENTS";

const DATA_CAT_REF = "data-category-reference";

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
            <span class="delete_task cursor_pointer" data-task-action="delete">Delete</span>
            <span class="view_task cursor_pointer" data-task-action="view">View</span>
          </div>
          
          <div class="show_more_options cursor_pointer" data-more-option="toggle">
            &vellip;
          </div>
        </div>

        <p class="categoryTitle"></p>
      </div>
    `;

  const getTaskTemplate = () => {
    const cloneTask = task.cloneNode(true);

    cloneTask.addEventListener("click", handleTaskAction);
    cloneTask.addEventListener("click", showMoreOptions);

    return cloneTask;
  };

  return { getTaskTemplate };
};

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
    
    const taskSection = target.closest(".task");

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

PubSub.subscribe(EVENTS.UI.MARK, markTask);

const taskTemplate = CreateTaskTemplate();

export { taskTemplate };
