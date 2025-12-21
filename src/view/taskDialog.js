import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";

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
          data-task-action="markStatus"
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

        <select name="label"></select>
      </div>

      <section>
        <button
          name="saveTaskButton"
          data-task-action="saveTask"
          class="btn-save_task"
        >
          Save
        </button>
      </section>
    </form>
  `;

  document.body.append(taskDialogContent);

  const form = taskDialogContent.querySelector("form");
  const categoryTitle = taskDialogContent.querySelector(".categoryTitle");

  let currentTaskSection;

  const labels = [];

  form.addEventListener("click", handleTaskAction);

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

  const displayViewTaskDialog = (msg, { category, taskSection }) => {
    MSG = msg;
    currentTaskSection = taskSection;

    categoryTitle.textContent = category.categoryTitleFormatted;
    form.title.value = category.title;
    form.date.value = formatDate(category.date);
    form.description.value = category.description;

    setValueOfSelect(category, "priority");

    form.markStatus.setAttribute("data-priority", category?.priority);

    resetLabel();

    setValueOfSelect(category, "label");

    const selectedLabelIndex = form.label.selectedIndex;

    form.input_label.value =
      selectedLabelIndex === -1 ? "" : form.label[selectedLabelIndex].value;

    taskDialogContent.showModal();
  };

  const displayAddTaskDialog = (msg) => {
    MSG = msg;

    form.title.value = "";
    form.date.value = "";
    form.description.value = "";
    categoryTitle.textContent = "Inbox";
    form.markStatus.setAttribute("data-priority", "2");

    setValueOfSelect({ priority: "2" }, "priority");

    taskDialogContent.showModal();
  };

  const removeTaskDialog = () => {
    taskDialogContent.remove();
  };

  const TaskAction = {
    saveTask,
    markStatus
  };

  function handleTaskAction(e) {
    const taskAction = e.target.dataset.taskAction;

    if (!taskAction) return;

    TaskAction[taskAction](e.target);
  }

  return { init };
}

export default TaskDialog;
