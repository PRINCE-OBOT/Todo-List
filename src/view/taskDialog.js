import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";

function TaskDialog() {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TaskDialog, removeTaskDialog);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.TASK_SENT, updateTaskDialog);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.LABEL_SENT, labelsSent);
  };

  const taskDialogContent = document.createElement("dialog");
  taskDialogContent.classList.add("TaskDialog_page");

  taskDialogContent.setAttribute("closedby", "any");

  taskDialogContent.innerHTML = `
    <form method="dialog" class="dialog_form">
      <div>
        <span>📫</span>
        <p class="categoryTitle"></p>
      </div>
      <div>
          <input type="checkbox" name="markStatus" class="mark-status" />
          <input name="title" type="text" class="title" />
      </div>
      <div>
        <span>📝</span
        ><textarea name="description" class="description"></textarea>
      </div>
      <div><span>📅</span><input name="date" type="date" class="date" /></div>
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
      <section>
        <button name="saveTaskButton" class="btn-save_task">Save</button>
      </section>
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

  const labels = [];

  form.saveTaskButton.addEventListener("click", saveTask);

  function saveTask() {
    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.EDIT, {
      title: form.title.value,
      description: form.description.value,
      label: form.label.value,
      status: form.label.checked,
      date: form.date.value,
      priority: form.priority.value
    });

    PubSub.publishSync(EVENTS.PAGE.LOAD.TODAY);
  }

  const setPriorityValue = (category) => {
    const indexOfPriority = [...form.priority.options].findIndex(
      (option) => option.value == category.priority
    );
    form.priority.selectedIndex = indexOfPriority;
  };

  const formatDate = (date) => {
    return date.split("T")[0];
  };

  const labelsSent = (msg, label) => {
    labels.push(...label);
  };

  const setLabelValueInSelect = (label) => {
    const option = document.createElement("option");

    option.value = label;
    option.textContent = label;

    form.label.append(option);
  };

  const updateTaskDialog = (msg, category) => {
    categoryTitle.textContent = category.categoryTitleFormatted;
    form.title.value = category.title;
    form.date.value = formatDate(category.date);
    form.description.value = category.description;

    setPriorityValue(category);

    form.label.value = category.label;
    form.markStatus.setAttribute("data-priority", category.priority);

    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.SEND_LABEL);
    labels.forEach(setLabelValueInSelect);

    taskDialogContent.showModal();
  };

  const removeTaskDialog = () => {
    taskDialogContent.remove();
  };

  return { init };
}

export default TaskDialog;
