import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);

    PubSub.subscribe(EVENTS.STORE.TASK_INDEXES_STORE.ADD, addTaskIndex);
  };

  const taskStore = [];

  // The length of the `taskIndexes` is used to track where to add a task or subtask in another task
  // The element in the `taskIndexes` is used to determine the index of the task in it own section
  const taskIndexes = [];

  const addTaskIndex = (msg, index) => {
    taskIndexes.push(index);
  };

  const clearTaskIndexes = () => {
    taskIndexes.splice(0);
  };

  const getTopLevelTask = () => {
    if (taskIndexes.length === 0) return taskStore;

    let task;
    taskIndexes.forEach((taskIndex) => {
      task ? (task = task.subTask[taskIndex]) : (task = taskStore[taskIndex]);
    });

    return task;
  };

  const addTask = (msg, task) => {
    const topLevelTask = getTopLevelTask();

    if (topLevelTask === taskStore) {
      taskStore.push(task);
    } else {
      if (!topLevelTask.subTask) topLevelTask.subTask = [];

      topLevelTask.subTask.push(task);
    }
  };

  const updateStorage = () => {
    console.log("taskStore", taskStore, "taskIndexes", taskIndexes);
  };

  function handleTaskStoreChange() {
    clearTaskIndexes();
    updateStorage();
  }

  return { init };
}

const taskStore = TaskStore();

export { taskStore };
