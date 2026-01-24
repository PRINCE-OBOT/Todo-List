import keys from "../constant";
import DOMHistory from "../DOMHistory";
import EVENTS from "../events";
import storage from "../storage";
import todoList from "../todo_list";

function DOMTask() {
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

      <p class="categoryPath"></p>
    </div>
  `;

  const mark = (target) => {
    todoList.mark(target.checked);

    const taskSection = DOMHistory.getLast();

    taskSection.textContent = "Task ";

    taskSection.textContent += target.checked ? "Completed" : "Not completed";

    todoList.mark(target.checked);

    setTimeout(() => taskSection.classList.add("task_mark"), 1000);

    setTimeout(() => {
      taskSection.remove();
      PubSub.publish(EVENTS.NAV_RERENDER);
    }, 1290);
  };

  const view = () => {
    const todoListObj = storage.get(keys.todo_list);
    const taskObj = todoList.get(todoListObj);
    PubSub.publish(EVENTS.SHOW_TASK_DIALOG, taskObj);
  };

  const TaskAction = {
    delete: () => {
      todoList.delete();
      DOMHistory.removeLast();
      PubSub.publish(EVENTS.NAV_RERENDER);
    },
    view,
    mark
  };

  function handleTaskAction(e) {
    const taskAction = e.target.dataset.taskAction;

    if (!taskAction) return;

    const taskSection = e.target.closest("[data-category-path]");

    DOMHistory.add(taskSection);

    const categoryPath = taskSection.getAttribute("data-category-path");

    todoList.pathUpdate(categoryPath);

    TaskAction[taskAction](e.target);
  }

  const template = () => {
    const cloneTask = task.cloneNode(true);
    cloneTask.addEventListener("click", handleTaskAction);
    return cloneTask;
  };

  const set = (taskObj, callback) => {
    const task = template();

    task.setAttribute("data-category-path", taskObj._categoryPath);

    const priority = task.querySelector("[data-priority]");
    const title = task.querySelector(".title");
    const description = task.querySelector(".description");
    const categoryPath = task.querySelector(".categoryPath");
    const markStatus = task.querySelector(".mark-status");

    priority.setAttribute("data-priority", taskObj.priority);
    markStatus.checked = taskObj.status;
    title.textContent = taskObj[keys.taskTitle] || taskObj[keys.subtaskTitle];
    description.textContent = taskObj.description;
    categoryPath.textContent = todoList.pathFormat(taskObj._categoryPath);

    callback(task, taskObj);
  };

  return { set, mark };
}

const DOMtask = DOMTask();

export { DOMtask };
