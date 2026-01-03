import PubSub from "pubsub-js";
import EVENTS from "../config/EVENTS";
import { label, path, taskAndCategoryHandler } from "../config/constant";
import { setTaskValue } from "../components/task";

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

    PubSub.subscribe(EVENTS.PAGE.CHANGE, updateActivePageViewValue);
  };

  const taskDialogContent = document.createElement("dialog");
  taskDialogContent.classList.add("TaskDialog_page");

  taskDialogContent.setAttribute("closedby", "any");

  taskDialogContent.innerHTML = `
    <form method="dialog" class="dialog_form">
      <div>
        <span>📫</span>
        <p class="taskTitle"></p>
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

    <br />

    <hr />

    <br />
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
  const taskTitle = taskDialogContent.querySelector(".taskTitle");
  const hr = taskDialogContent.querySelector("hr");

  const subtaskSection = document.createElement("div");
  subtaskSection.classList.add("subtaskSection");

  let currentTaskSection;

  const isAddingSubtask = (taskData) => {
    const tasksID = path.getTasksID();

    const modify = ({ taskData, deleteKey, setKey }) => {
      delete taskData[deleteKey];
      taskData[setKey] = form.title.value;
    };

    if (tasksID.length >= 1) {
      modify({ taskData, deleteKey: "title", setKey: "subtitle" });
    } else {
      modify({ taskData, deleteKey: "subtitle", setKey: "title" });
    }
  };

  function saveTask() {
    const taskData = {
      title: form.title.value,
      description: form.description.value,
      label: form.input_label.value,
      status: form.markStatus.checked,
      date: form.date.value,
      priority: form.priority.value
    };

    const saveBtnAction = form.saveTaskButton.getAttribute(
      "data-save-btn-action"
    );

    if (saveBtnAction === "edit") {
      taskAndCategoryHandler.editTask(taskData);
    } else {
      isAddingSubtask(taskData);
      taskData.id = crypto.randomUUID();
      taskAndCategoryHandler.addTask(taskData);
    }

    const changeMainView = form.saveTaskButton.getAttribute(
      "data-change-main-view"
    );

    PubSub.publishSync(EVENTS.PAGE.LOAD[changeMainView], changeMainView);
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

  const setValueOfSelect = (task, element) => {
    const indexOfPriority = [...form[element].options].findIndex((option) => {
      return option.value == task[element];
    });
    form[element].selectedIndex = indexOfPriority;
  };

  const formatDate = (date) => {
    return date.split("T")[0];
  };

  const setLabelValueInSelect = (label) => {
    const option = document.createElement("option");

    option.value = label;
    option.textContent = label;

    form.label.append(option);
  };

  const resetLabel = () => {
    form.label.innerHTML = "";

    label.get().forEach(setLabelValueInSelect);
  };

  const appendSubtaskToSubtaskSection = (subtask) => {
    subtaskSection.append(subtask);
  };

  const isSubtask = (subtasks) => {
    if (!subtasks) return;

    subtasks.forEach((subtask) => {
      setTaskValue(subtask, appendSubtaskToSubtaskSection);
    });
  };

  const resetSubtaskSection = () => {
    subtaskSection.innerHTML = "";
    hr.after(subtaskSection);
  };

  const resetTaskDialog = () => {
    resetLabel();
    resetSubtaskSection();
  };

  const modifySaveBtnAction = (saveBtnAction) => {
    form.saveTaskButton.setAttribute("data-save-btn-action", saveBtnAction);
  };

  const displayViewTaskDialog = (msg, { task, taskSection }) => {
    currentTaskSection = taskSection;

    taskTitle.textContent = path.generateCategory(taskSection);
    form.title.value = task.title || task.subtitle;
    form.date.value = formatDate(task.date);
    form.description.value = task.description;

    hr.classList.remove("hide");

    modifySaveBtnAction("edit");

    resetTaskDialog(task);
    hr.after(addSubtaskBtn);

    setValueOfSelect(task, "priority");
    form.markStatus.setAttribute("data-priority", task?.priority);

    setValueOfSelect(task, "label");
    form.input_label.value = form.label.value;

    isSubtask(task.subtasks);

    taskDialogContent.showModal();
  };

  const displayAddTaskDialog = (msg) => {
    form.title.value = "";
    form.date.value = "";
    form.description.value = "";
    taskTitle.textContent = "Inbox";
    form.input_label.value = "";

    hr.classList.add("hide");

    subtaskSection.remove();
    addSubtaskBtn.remove();

    modifySaveBtnAction("add");

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

  const updateActivePageViewValue = (msg,  {value} ) => {
    form.saveTaskButton.setAttribute("data-change-main-view", value);
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
