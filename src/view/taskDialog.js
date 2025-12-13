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
        <input type="checkbox" name="markStatus" class="mark-status" /><input name="title" type="text" class="title" />
      </div>
      <div>
        <span>📝</span><textarea name="description" class="description"></textarea>
      </div>
      <div>
        <span>📅</span><input name="date" type="date" class="date" />
      </div>
      <div>
        <span>🏳️</span>
        <select name="priority" class="priority">
        <option value="1">High Priority</option>
        <option value="2">Normal Priority</option>
        <option value="3">Low Priority</option>
        </select>
      </div>
      <div>
        <span>🏷️</span>
        <select name="label" class="label">
        </select>
      </div>
      <div>
        <button name="saveButton">Save ✅</button>
      </div>
      
    </form>
  `;

  document.body.append(taskDialogContent);

  const form = taskDialogContent.querySelector("form");
  const categoryTitle = taskDialogContent.querySelector(".categoryTitle");

  const PriorityValue = {
    1: "High",
    2: "Normal",
    3: "Low"
  };

  const setPriorityValue = (category) => {
    const indexOfPriority = [...form.priority.options].findIndex(
      (option) => option.value == category.priority
    );
    form.priority.selectedIndex = indexOfPriority;
  };

  const formatDate = (date)=>{
    return date.split("T")[0];
  }

  const updateTaskDialog = (msg, category) => {
    categoryTitle.textContent = category.categoryTitleFormatted;
    form.title.value = category.title;
    form.date.value = formatDate(category.date);
    form.description.value = category.description;

    setPriorityValue(category);
    form.label.value = category.label;

    taskDialogContent.showModal();
  };

  const removeTaskDialog = () => {
    taskDialogContent.remove();
  };

  return { init };
}

export default TaskDialog;
