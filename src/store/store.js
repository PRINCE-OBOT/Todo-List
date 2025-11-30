import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.MARK_STATUS, markTaskStatus);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.DELETE, deleteTask);

    PubSub.subscribe(
      EVENTS.STORE.TASK_INDEXES_STORE.CHANGE,
      handleTaskIndexesChange
    );
    PubSub.subscribe(EVENTS.STORE.TASK_INDEXES_STORE.ADD, addTaskIndex);
  };

  const taskStore = [];
  // The length of `taskIndexes` tracks the current task
  // The element in `taskIndexes` point to the index of the current task in it own section
  const taskIndexes = [];
  const NO_TASK_REFERENCE = "NO TASK REFERENCES THIS INDEX";
  const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

  // ============  Task Index (Start)  =========== \\
  const getActiveTask = () => {
    let activeTask = NO_TASK_REFERENCE;

    for (let i = 0; i < taskIndexes.length; i++) {
      const taskIndex = taskIndexes[i];

      if (activeTask === NO_TASK_REFERENCE) {
        activeTask = taskStore[taskIndex];
      } else {
        if (!activeTask.subTask) {
          return NO_TASK_REFERENCE;
        }
        activeTask = activeTask.subTask[taskIndex];
      }

      if (!activeTask) {
        return NO_TASK_REFERENCE;
      }
    }

    return activeTask;
  };

  const addTaskIndex = (msg, index) => {
    taskIndexes.push(index);

    const activeTask = getActiveTask();

    if (activeTask === NO_TASK_REFERENCE) {
      taskIndexes.pop();
      console.log(NO_TASK_REFERENCE);
    }
  };

  const clearTaskIndexes = () => {
    taskIndexes.splice(0);
  };

  const displayTaskIndexes = () => {
    console.log(taskIndexes);
  };

  const getActiveTaskIndexAndDelete = () => {
    const taskIndexesLength = taskIndexes.length - 1;
    const currentTaskIndex = taskIndexes[taskIndexesLength];

    // Remove the activeTask index from taskIndexes so
    // `getActiveTask()` return the immediate task
    taskIndexes.pop();

    return currentTaskIndex;
  };
  // ================ Task Index (Stop) ===============  \\

  // ================  Task (Start)  ===================== \\
  const getLastIndexOfPriority = (currentTaskSection, priorityLevel) => {
    const lastIndexPriority = currentTaskSection.findLastIndex(
      (task) => task.priority === priorityLevel
    );
    return lastIndexPriority;
  };

  const getLastIndexOfPriorityNextIndex = (priority, activeTask) => {
    let lastIndexPriority = 0;
    let lastIndexOfPriorityNextIndex;

    const priorityLevels = PRIORITIES.slice(PRIORITIES.indexOf(priority));

    for (let i = 0; i < priorityLevels.length; i++) {
      const priorityLevel = priorityLevels[i];

      if (activeTask === NO_TASK_REFERENCE) {
        lastIndexPriority = getLastIndexOfPriority(taskStore, priorityLevel);
      } else {
        lastIndexPriority = getLastIndexOfPriority(
          activeTask.subTask,
          priorityLevel
        );
      }

      if (lastIndexPriority >= 0) {
        lastIndexOfPriorityNextIndex = lastIndexPriority + 1;
        break;
      }
    }

    return lastIndexPriority < 0 ? 0 : lastIndexOfPriorityNextIndex;
  };

  const addTask = (msg, task) => {
    const activeTask = getActiveTask();

    let lastIndexPriority = getLastIndexOfPriorityNextIndex(
      task.priority,
      activeTask
    );

    if (activeTask === NO_TASK_REFERENCE) {
      taskStore.splice(lastIndexPriority, 0, task);
    } else {
      if (!activeTask.subTask) activeTask.subTask = [];
      activeTask.subTask.splice(lastIndexPriority, 0, task);
    }
  };

  const markTaskStatus = (msg, status) => {
    const currentTaskIndex = getActiveTaskIndexAndDelete();

    if (currentTaskIndex === undefined) {
      console.log(NO_TASK_REFERENCE);
    } else {
      const activeTask = getActiveTask();

      if (activeTask === NO_TASK_REFERENCE) {
        taskStore[currentTaskIndex].status = status;
      } else {
        activeTask.subTask[currentTaskIndex].status = status;
      }
    }
  };

  const deleteTask = (msg) => {
    const currentTaskIndex = getActiveTaskIndexAndDelete();

    if (currentTaskIndex === undefined) {
      console.log(NO_TASK_REFERENCE);
    } else {
      const activeTask = getActiveTask();

      if (activeTask === NO_TASK_REFERENCE) {
        taskStore.splice(currentTaskIndex, 1);
      } else {
        activeTask.subTask.splice(currentTaskIndex, 1);

        if (activeTask.subTask.length === 0) {
          delete activeTask.subTask;
        }
      }
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
