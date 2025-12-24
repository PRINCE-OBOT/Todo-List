import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";
import { taskTemplate } from "../components/task";

function TaskDialog() {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TASK_DIALOG, removeTaskDialog);
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.VIEW_TASK_DIALOG,
      displayViewTaskDialog
    );
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.ADD_TASK_DIALOG,
      displayAddTaskDialog
    );
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
        <input
          type="checkbox"
          name="markStatus"
          class="mark-status"
          data-task-dialog="markStatus"
        />
        <input name="title" type="text" class="title" placeholder="Title" />
      </div>

      <div>
        <span>📝</span
        ><textarea
          name="description"
          class="description"
          placeholder="Description"
        ></textarea>
      </div>

      <div class="date">
        <span>📅</span>
        <input name="date" type="date" />
      </div>

      <div>
        <span>🏳️</span>
        <select name="priority">
          <option value="1">High Priority</option>
          <option value="2">Normal Priority</option>
          <option value="3">Low Priority</option>
        </select>
      </div>

      <div class="label">
        <span class="label_tag">🏷️</span>

        <input
          class="input_"
          type="text"
          name="input_label"
          placeholder="Enter new label"
        />

        <select name="label" data-task-dialog="changeLabel"></select>
      </div>

      <section>
        <button
          name="saveTaskButton"
          data-task-dialog="saveTask"
          class="btn-save_task"
        >
          Save
        </button>
      </section>
      
      </form>

      <br>
      
      <hr>
      
      <br>
      `;

  const addSubtaskBtn = (function createAddSubTaskBtn() {
    const div = document.createElement("div");
    div.classList.add("btn_add_subtask", "cursor_pointer");

    div.innerHTML = `
      <span>&#10011; </span>
      <span>Add sub-task</span>
    `;

    return div;
  })();

  document.body.append(taskDialogContent);

  const form = taskDialogContent.querySelector("form");
  const categoryTitle = taskDialogContent.querySelector(".categoryTitle");
  const hr = taskDialogContent.querySelector("hr");

  const subtaskSection = document.createElement("div");
  subtaskSection.classList.add("subtaskSection");

  let currentTaskSection;

  const DATA_CAT_REF = "data-category-reference";

  const labels = [];

  let MSG;

  function saveTask() {
    const taskData = {
      title: form.title.value,
      description: form.description.value,
      label: form.input_label.value,
      status: form.markStatus.checked,
      date: form.date.value,
      priority: form.priority.value
    };

    if (MSG === EVENTS.TODO_LIST.CATEGORY.VIEW_TASK_DIALOG) {
      PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.EDIT, taskData);
    } else {
      taskData.id = crypto.randomUUID();

      PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.ADD, taskData);
    }

    PubSub.publish(EVENTS.PAGE.LOAD.TODAY);
  }

  const markStatus = (target) => {
    PubSub.publishSync(EVENTS.UI.MARK, {
      target,
      taskSection: currentTaskSection
    });
    taskDialogContent.close();
  };

  const changeLabel = () => {
    form.input_label.value = form.label.value;
  };

  const setValueOfSelect = (category, element) => {
    const indexOfPriority = [...form[element].options].findIndex((option) => {
      return option.value == category[element];
    });
    form[element].selectedIndex = indexOfPriority;
  };

  const formatDate = (date) => {
    return date.split("T")[0];
  };

  const labelsSent = (msg, label) => {
    labels.splice(0);
    labels.push(...label);
  };

  const resetLabel = () => {
    PubSub.publishSync(EVENTS.TODO_LIST.CATEGORY.SEND_LABEL);

    form.label.innerHTML = "";

    labels.forEach(setLabelValueInSelect);
  };

  const setLabelValueInSelect = (label) => {
    const option = document.createElement("option");

    option.value = label;
    option.textContent = label;

    form.label.append(option);
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

    priority.setAttribute("data-priority", category.priority);

    title.textContent = category.title;
    categoryTitle.textContent = category.categoryTitleFormatted;
    description.textContent = category.description;

    addLabelValue(category);

    subtaskSection.append(task);
  };

  const isSubtask = (subtasks) => {
    if (!subtasks) return;

    subtasks.forEach(setTaskValue);
  };

  const resetSubtaskSection = () => {
    subtaskSection.innerHTML = "";
    hr.after(subtaskSection);
  };

  const resetTaskDialog = (category) => {
    resetLabel();
    resetSubtaskSection();
  };
  const displayViewTaskDialog = (msg, { category, taskSection }) => {
    MSG = msg;
    currentTaskSection = taskSection;

    categoryTitle.textContent = category.categoryTitleFormatted;
    form.title.value = category.title;
    form.date.value = formatDate(category.date);
    form.description.value = category.description;

    hr.classList.remove("hide");

    resetTaskDialog(category);
    hr.after(addSubtaskBtn);

    setValueOfSelect(category, "priority");
    form.markStatus.setAttribute("data-priority", category?.priority);

    setValueOfSelect(category, "label");
    form.input_label.value = form.label.value;

    isSubtask(category.subtasks);

    taskDialogContent.showModal();
  };

  const displayAddTaskDialog = (msg) => {
    MSG = msg;

    form.title.value = "";
    form.date.value = "";
    form.description.value = "";
    categoryTitle.textContent = "Inbox";
    form.input_label.value = "";

    hr.classList.add("hide");

    subtaskSection.remove();
    addSubtaskBtn.remove();

    resetLabel();

    form.markStatus.setAttribute("data-priority", "2");

    setValueOfSelect({ priority: "2" }, "priority");

    taskDialogContent.showModal();
  };

  const removeTaskDialog = () => {
    taskDialogContent.remove();
  };

  const TaskAction = {
    saveTask,
    markStatus,
    changeLabel
  };

  function handleTaskAction(e) {
    const taskAction = e.target.dataset.taskDialog;

    if (!taskAction) return;

    TaskAction[taskAction](e.target);
  }

  form.addEventListener("click", handleTaskAction);
  form.addEventListener("change", handleTaskAction);
  addSubtaskBtn.addEventListener("click", displayAddTaskDialog);

  return { init };
}

export default TaskDialog;
