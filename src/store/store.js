import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.MARK_STATUS, markTaskStatus);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.EDIT, editTask);
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
  const addTask = (msg, task) => {
    const activeTask = getActiveTask();

    if (activeTask === NO_TASK_REFERENCE) {
      taskStore.push(task);
    } else {
      activeTask.subTask.push(task);
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

  const editTask = (msg, task) => {
    const currentTaskIndex = getActiveTaskIndexAndDelete();

    if (currentTaskIndex === undefined) {
      console.log(NO_TASK_REFERENCE);
    } else {
      const activeTask = getActiveTask();

      if (activeTask === NO_TASK_REFERENCE) {
        taskStore[currentTaskIndex] = task;
      } else {
        activeTask.subTask[currentTaskIndex] = task;
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

  const sortTaskBaseOnPriority = (activeTaskSection) => {
    activeTaskSection.sort(
      (currentTask, nextTask) => currentTask.priority - nextTask.priority
    );
  };

  const handleTaskPrioritySort = () => {
    taskIndexes.pop();

    const activeTaskSection = getActiveTask();

    if (activeTaskSection === NO_TASK_REFERENCE) {
      sortTaskBaseOnPriority(taskStore);
    } else {
      sortTaskBaseOnPriority(activeTaskSection);
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
    handleTaskPrioritySort();
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
