import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.MARK, markTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.DELETE, deleteTask);

    PubSub.subscribe(
      EVENTS.STORE.TASK_INDEXES_STORE.CHANGE,
      handleTaskIndexesChange
    );
    PubSub.subscribe(EVENTS.STORE.TASK_INDEXES_STORE.ADD, addTaskIndex);
  };

  const taskStore = [];
  // The length of the `taskIndexes` is used to track where to add a task or subtask in another task (Level)
  // The element in the `taskIndexes` is used to determine the index of the task in it own section
  const taskIndexes = [];
  const TASK_EMPTY = "TASK DOES NOT EMPTY";

  // ============  Task Index (Start)  =========== \\
  const getTopLevelTaskSection = (msg) => {
    if (taskIndexes.length === 0) return taskStore;

    let topLevelTask;

    for (let i = 0; i < taskIndexes.length; i++) {
      const taskIndex = taskIndexes[i];

      if (topLevelTask) {
        topLevelTask = topLevelTask.subTask[taskIndex];
      } else {
        topLevelTask = taskStore[taskIndex];
      }

      if (!topLevelTask) {
        return TASK_EMPTY;
      }
    }

    if (msg === EVENTS.STORE.TASK_STORE.ADD) {
      if (!topLevelTask.subTask) topLevelTask.subTask = [];
    }
    return topLevelTask.subTask;
  };

  const addTaskIndex = (msg, index) => {
    taskIndexes.push(index);

    const topLevelTaskSection = getTopLevelTaskSection();

    if (topLevelTaskSection === TASK_EMPTY) {
      taskIndexes.pop();
      console.log(TASK_EMPTY);
    }
  };

  const clearTaskIndexes = () => {
    taskIndexes.splice(0);
  };

  const displayTaskIndexes = () => {
    console.log(taskIndexes);
  };

  const getTopLevelTaskIndexAndDelete = () => {
    const taskIndexesLength = taskIndexes.length - 1;
    const topLevelTaskIndex = taskIndexes[taskIndexesLength];

    // Remove the topLevelTask index from taskIndexes so
    // `getTopLevelTaskSection()` return the section where the topLevelTask is
    taskIndexes.pop();

    return topLevelTaskIndex;
  };
  // ================ Task Index (Stop) ===============  \\

  // ================  Task (Start)  ===================== \\
  const addTask = (msg, task) => {
    const topLevelTaskSection = getTopLevelTaskSection();
    topLevelTaskSection.push(task);
  };

  const markTask = (msg, status) => {
    const topLevelTaskIndex = getTopLevelTaskIndexAndDelete();

    if (topLevelTaskIndex === undefined) {
      console.log(TASK_EMPTY);
    } else {
      const topLevelTaskSection = getTopLevelTaskSection(msg);
      topLevelTaskSection[topLevelTaskIndex].status = status;
    }
  };

  const deleteTask = (msg) => {
    const topLevelTaskIndex = getTopLevelTaskIndexAndDelete();

    const topLevelTaskSection = getTopLevelTaskSection();

    if (topLevelTaskIndex === undefined) {
      console.log(TASK_EMPTY);
    } else {
      topLevelTaskSection.splice(topLevelTaskIndex, topLevelTaskIndex + 1);
    }
  };
  // ================  Task (Stop)  ===================== \\

  // ================  Storage (Start)  ===================== \\
  const updateStorage = () => {
    console.log("taskStore", taskStore, "taskIndexes", taskIndexes);
  };
  // ================  Storage (Stop)  ===================== \\

  // ================  Handle (Start)  ===================== \\
  function handleTaskStoreChange() {
    clearTaskIndexes();
    updateStorage();
  }

  function handleTaskIndexesChange() {
    displayTaskIndexes();
  }
  // ================  Handle (Stop)  ===================== \\

  return { init };
}

const taskStore = TaskStore();

export { taskStore };
