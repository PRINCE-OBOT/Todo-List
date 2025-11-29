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

  // =======================
  const addTaskIndex = (msg, index) => {
    taskIndexes.push(index);
  };

  const clearTaskIndexes = () => {
    taskIndexes.splice(0);
  };

  const displayTaskIndexes = () => {
    console.log(taskIndexes);
  };

  const getTopLevelTask = () => {
    if (taskIndexes.length === 0) return taskStore;

    let topLevelTask;
    taskIndexes.forEach((taskIndex) => {
      topLevelTask
        ? (topLevelTask = topLevelTask.subTask[taskIndex])
        : (topLevelTask = taskStore[taskIndex]);
    });

    return topLevelTask;
  };
  // =======================

  const addTask = (msg, task) => {
    const topLevelTask = getTopLevelTask();

    if (topLevelTask === taskStore) {
      taskStore.push(task);
    } else {
      if (!topLevelTask.subTask) topLevelTask.subTask = [];

      topLevelTask.subTask.push(task);
    }
  };

  const deleteTask = (msg) => {
    const taskIndexesLength = taskIndexes.length - 1;
    const topLevelTaskIndex = taskIndexes[taskIndexesLength];

    // Delete the last task in `taskIndexes` to shorten the level
    // To get the section the top level task is
    taskIndexes.pop();
    const topLevelTaskSection = getTopLevelTask();
    topLevelTaskSection.splice(topLevelTaskIndex, topLevelTaskIndex + 1);
  };

  const updateStorage = () => {
    console.log("taskStore", taskStore, "taskIndexes", taskIndexes);
  };

  function handleTaskStoreChange() {
    clearTaskIndexes();
    updateStorage();
  }

  function handleTaskIndexesChange() {
    displayTaskIndexes();
  }

  return { init };
}

const taskStore = TaskStore();

export { taskStore };
