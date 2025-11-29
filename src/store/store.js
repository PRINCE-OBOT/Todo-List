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

  const getTopLevelTaskSection = () => {
    if (taskIndexes.length === 0) return taskStore;

    let topLevelTask;
    taskIndexes.forEach((taskIndex) => {
      if (topLevelTask) {
        topLevelTask = topLevelTask.subTask[taskIndex];
      } else {
        topLevelTask = taskStore[taskIndex];
      }
    });

    if (!topLevelTask.subTask) topLevelTask.subTask = [];

    return topLevelTask.subTask;
  };

  // =======================
  const addTask = (msg, task) => {
    const topLevelTaskSection = getTopLevelTaskSection();
    topLevelTaskSection.push(task);
  };

  const deleteTask = (msg) => {
    const taskIndexesLength = taskIndexes.length - 1;
    const topLevelTaskIndex = taskIndexes[taskIndexesLength];

    debugger;
    // Delete the last task in `taskIndexes` to shorten the level
    // To get the section the top level task is
    taskIndexes.pop();
    const topLevelTaskSection = getTopLevelTaskSection();
    debugger;
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
