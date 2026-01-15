import keys from "../constant";
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

      <p class="categoryTitle"></p>
    </div>
  `;

  const TaskAction = {
    delete: () => {
      todoList.delete();
    },
    view: () => {
      const todoListObj = storage.get(keys.todo_list)
      const taskObj = todoList.get(todoListObj);
      PubSub.publish(EVENTS.SHOW_TASK_DIALOG, taskObj);
    },
    mark: (target) => {
      markTask(target.checked);
    }
  };

  function handleTaskAction(e) {
    const taskAction = e.target.dataset.taskAction;

    if (!taskAction) return;

    const categoryPath = e.target.closest("[data-category-path]")?.getAttribute("data-category-path");

    todoList.pathUpdate(categoryPath);

    TaskAction[taskAction](e.target);
  }

  const template = () => {
    const cloneTask = task.cloneNode(true);
    cloneTask.addEventListener("click", handleTaskAction);
    return cloneTask;
  };

  const markTask = (target) => {
    todoList.mark(target.checked);

    const lastTaskSection = taskSection.getLast();

    lastTaskSection.textContent = "Task ";

    lastTaskSection.textContent += target.checked
      ? "Completed"
      : "Not completed";

    setTimeout(() => lastTaskSection.classList.add("task_mark"), 1000);

    setTimeout(() => lastTaskSection.remove(), 1290);
  };

  const set = (taskObj, callback) => {
    const task = template();

    task.setAttribute("data-category-path", taskObj.categoryPath);

    const priority = task.querySelector("[data-priority]");
    const title = task.querySelector(".title");
    const description = task.querySelector(".description");

    priority.setAttribute("data-priority", taskObj.priority);

    title.textContent = taskObj[keys.taskTitle] || taskObj[keys.subtaskTitle];

    description.textContent = taskObj.description;

    callback(task, taskObj);
  };

  return { set };
}

const DOMtask = DOMTask();

export { DOMtask };
