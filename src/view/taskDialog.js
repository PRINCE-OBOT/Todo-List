import EVENTS from "../config/EVENTS";

function TaskDialog() {
  const init = () => {
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.TASK_SENT, updateTaskDialog);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TaskDialog, removeTaskDialog);
  };

  const taskDialogContent = document.createElement("dialog");
  taskDialogContent.classList.add("TaskDialog_page");

  taskDialogContent.setAttribute("closedby", "any");

  taskDialogContent.innerHTML = `
    <form method="dialog" >
      <div>
        <span>📫</span><p class="categoryTitle"></p>
      </div>
      <div>
        <input type="checkbox" class="mark-status" /><input type="text" class="title" />
      </div>
      <div>
        <span>📝</span><textarea class="description"></textarea>
      </div>
      <div>
        <span>📅</span><input type="date" class="date" />
      </div>
      <div>
        <span>🏳️</span>
        <select class="priority">
        <option value="1">High Priority</option>
        <option value="2">Normal Priority</option>
        <option value="3">Low Priority</option>
        </select>
      </div>
      <div>
        <span>🏷️</span>
        <select class="label">
        </select>
      </div>
      <div>Save ✅</div>
      
    </form>
  `;

  document.body.append(taskDialogContent);

  const categoryTitle = taskDialogContent.querySelector(".categoryTitle");
  const title = taskDialogContent.querySelector(".title");
  const description = taskDialogContent.querySelector(".description");
  const priority = taskDialogContent.querySelector(".priority");
  const label = taskDialogContent.querySelector(".label");
  const date = taskDialogContent.querySelector(".date");

  const PriorityValue = {
    1: "High",
    2: "Normal",
    3: "Low"
  };

  const setPriorityValue = (category) => {
    const indexOfPriority = [...priority.options].findIndex(
      (option) => option.value == category.priority
    );
    priority.selectedIndex = indexOfPriority;
  };

  const updateTaskDialog = (msg, category) => {
    categoryTitle.textContent = category.categoryTitleFormatted;
    title.value = category.title;
    date.value = category.date;
    description.value = category.description;

    setPriorityValue(category);
    label.value = category.label;

    taskDialogContent.showModal();
  };

  const removeTaskDialog = () => {
    taskDialogContent.remove();
  };

  return { init };
}

export default TaskDialog;
