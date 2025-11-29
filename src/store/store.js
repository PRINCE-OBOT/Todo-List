import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);
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
  const TASK_EMPTY = "TASK_EMPTY";

  // ============  Task Index (Start)  =========== \\
  const getTopLevelTaskSection = () => {
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

    if (!topLevelTask.subTask) topLevelTask.subTask = [];
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
  // ================ Task Index (Stop) ===============  \\

  // ================  Task (Start)  ===================== \\

  const addTask = (msg, task) => {
    const topLevelTaskSection = getTopLevelTaskSection();
    topLevelTaskSection.push(task);
  };

  const deleteTask = (msg) => {
    const taskIndexesLength = taskIndexes.length - 1;

    const topLevelTaskIndex = taskIndexes[taskIndexesLength];

    // Removing the topLevelTask index from taskIndexes to ensure return of the section where the topLevelTask is
    taskIndexes.pop();

    const topLevelTaskSection = getTopLevelTaskSection();

    topLevelTaskSection.splice(topLevelTaskIndex, topLevelTaskIndex + 1);
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
