import PubSub from "pubsub-js";
import EVENTS from "../events";
import { DOMtask } from "../components/task";
import todoList from "../todo_list";
import keys from "../constant";

function TaskDialog() {
  const init = () => {
    PubSub.subscribe(EVENTS.SHOW_TASK_DIALOG, showTaskDialog);
  };

  const taskDialogContent = document.createElement("dialog");
  taskDialogContent.classList.add("TaskDialog_page");

  taskDialogContent.setAttribute("closedby", "any");

  taskDialogContent.innerHTML = `
    <form method="dialog" class="dialog_form">
      <div>
        <span>📫</span>
        <p class="taskPath"></p>
      </div>

      <div>
        <input
          type="checkbox"
          name="markStatus"
          class="mark-status"
          data-task-dialog-action="markStatus"
        />
        <input name="title" type="text" class="title" placeholder="Title" />
      </div>

      <div>
        <span>📝</span
        ><textarea
          name="description"
          class="description"
          wrap="soft"
          placeholder="Description"
        ></textarea>
      </div>

      <div class="date">
        <span>📅</span>
        <div class="task_dialog_date_section">
          <p>Due Date</p>
          <input name="dueDate" type="date" class="dueDate" />
        </div>
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
          readonly
          placeholder="Future feature..."
        />

        <select name="label" data-task-dialog-action="changeLabel"></select>
      </div>

      <section>
        <button
          name="saveTaskButton"
          data-task-dialog-action="saveTask"
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

  const task_dialog_date_section = taskDialogContent.querySelector(
    ".task_dialog_date_section"
  );

  const addSubtaskBtn = (function createAddSubTaskBtn() {
    const div = document.createElement("div");
    div.classList.add("btn_add_subtask", "cursor_pointer");

    div.innerHTML = `
      <span>&#10011; </span>
      <span>Add sub-task</span>
    `;

    return div;
  })();

  const inputCreatedAt = document.createElement("input");
  const title_createAt = document.createElement("p");

  inputCreatedAt.name = "createdAt";
  inputCreatedAt.readOnly = true;
  title_createAt.textContent = "Created";

  document.body.append(taskDialogContent);

  const form = taskDialogContent.querySelector("form");
  const taskPath = taskDialogContent.querySelector(".taskPath");
  const hr = taskDialogContent.querySelector("hr");

  const subtaskSection = document.createElement("div");
  subtaskSection.classList.add("subtaskSection");

  const showFillTaskDialog = (taskObj) => {
    taskPath.textContent = todoList.pathFormat();
    form.title.value = taskObj.taskTitle || taskObj.subtaskTitle;
    inputCreatedAt.value = formatDate(taskObj?._createdAt);
    form.dueDate.value = formatDate(taskObj?.dueDate);
    form.description.value = taskObj.description;
    form.markStatus.style.visibility = "visible";
    form.markStatus.checked = taskObj.status;

    task_dialog_date_section.append(title_createAt, inputCreatedAt);
    hr.classList.remove("hide");

    modifySaveBtnAction(keys.edit);

    resetTaskDialog(taskObj);
    hr.after(addSubtaskBtn);

    setValueOfSelect(taskObj, "priority");
    form.markStatus.setAttribute("data-priority", taskObj?.priority);

    setValueOfSelect(taskObj, "label");
    form.input_label.value = form.label.value;

    isSubtask(taskObj[keys.subtasks]);

    taskDialogContent.showModal();
  };

  const showUnFillTaskDialog = () => {
    taskPath.textContent = todoList.pathFormat();
    form.title.value = "";
    form.dueDate.value = "";
    form.description.value = "";
    form.input_label.value = "";
    form.markStatus.checked = false;
    form.markStatus.style.visibility = "hidden";

    hr.classList.add("hide");

    inputCreatedAt.remove();
    title_createAt.remove();
    subtaskSection.remove();
    addSubtaskBtn.remove();

    modifySaveBtnAction(keys.new);

    form.markStatus.setAttribute("data-priority", "2");

    setValueOfSelect({ priority: "2" }, "priority");

    taskDialogContent.showModal();
  };

  const showTaskDialog = (msg, taskObj) => {
    if (taskObj) {
      showFillTaskDialog(taskObj);
    } else {
      showUnFillTaskDialog();
    }
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

  const appendSubtaskToSubtaskSection = (subtask) => {
    subtaskSection.append(subtask);
  };

  const isSubtask = (subtasks) => {
    if (!subtasks) return;

    subtasks.sort(todoList.sortPriority).forEach((subtask) => {
      DOMtask.set(subtask, appendSubtaskToSubtaskSection);
    });
  };

  const resetSubtaskSection = () => {
    subtaskSection.innerHTML = "";
    hr.after(subtaskSection);
  };

  const resetTaskDialog = () => {
    resetSubtaskSection();
  };

  const modifySaveBtnAction = (saveBtnAction) => {
    form.saveTaskButton.setAttribute("data-save-btn-action", saveBtnAction);
  };

  const getTaskValue = () => {
    return {
      title: form.title.value,
      description: form.description.value,
      label: form.input_label.value,
      status: form.markStatus.checked,
      dueDate: form.dueDate.value,
      priority: form.priority.value
    };
  };

  function saveTask() {
    const taskValue = getTaskValue();

    if (taskValue.title.trim() === "" || taskValue.description.trim() === "")
      return;

    const saveBtnAction = form.saveTaskButton.getAttribute(
      "data-save-btn-action"
    );

    if (saveBtnAction === keys.edit) {
      todoList.edit(taskValue);
    } else {
      todoList.addTask(taskValue);
    }

    PubSub.publish(EVENTS.NAV_RERENDER);
  }

  const taskDialogAction = {
    saveTask,
    markStatus: (target) => {
      DOMtask.mark(target);
      taskDialogContent.close();
    },
    changeLabel
  };

  function handleTaskDialogAction(e) {
    const action = e.target.dataset.taskDialogAction;

    if (!action) return;

    taskDialogAction[action](e.target);
  }

  form.addEventListener("click", handleTaskDialogAction);
  form.addEventListener("change", handleTaskDialogAction);

  addSubtaskBtn.addEventListener("click", showUnFillTaskDialog);

  return { init };
}

export default TaskDialog;
