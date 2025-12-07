import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.ADD, addTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.MARK_STATUS, markTaskStatus);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.EDIT, editTask);
    PubSub.subscribe(EVENTS.STORE.TASK_STORE.FILTER_BY, handleFilterTaskBy);
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
  const SUBTASK_DEEP = "SUBTASK TOO DEEP";
  const TASK_DELETED = "LAST TASK DELETED";

  // ============  Task Index (Start)  =========== \\
  const getLastReferenceTaskSection = (msg) => {
    let lastReferenceTaskSection = taskStore;

    for (let i = 0; i < taskIndexes.length; i++) {
      const taskIndex = taskIndexes[i];

      const lastReferenceTask = lastReferenceTaskSection[taskIndex];

      if (msg === EVENTS.STORE.TASK_STORE.ADD) {
        if (!lastReferenceTask.subtask) lastReferenceTask.subtask = [];
        lastReferenceTaskSection = lastReferenceTask.subtask;
      } else {
        lastReferenceTaskSection = lastReferenceTask?.subtask || [];
      }

      if (msg === EVENTS.STORE.TASK_STORE.DELETE) {
        if (lastReferenceTask.subtask.length === 1) {
          delete lastReferenceTask.subtask;
          return TASK_DELETED;
        }
      }

      if (msg === EVENTS.STORE.TASK_INDEXES_STORE.ADD) {
        if (lastReferenceTask === undefined) {
          return NO_TASK_REFERENCE;
        }
      }
    }

    return lastReferenceTaskSection;
  };

  const addTaskIndex = (msg, index) => {
    taskIndexes.push(index);

    const lastReferenceTaskSection = getLastReferenceTaskSection(msg);

    if (lastReferenceTaskSection === NO_TASK_REFERENCE) {
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

  const extractLastReferenceTaskIndex = () => {
    const lastReferenceTaskIndex = taskIndexes.pop();

    return lastReferenceTaskIndex !== undefined
      ? lastReferenceTaskIndex
      : NO_TASK_REFERENCE;
  };
  // ================ Task Index (Stop) ===============  \\

  // ================  Task (Start)  ===================== \\

  const sortTaskBaseOnPriority = (currentTask, nextTask) =>
    currentTask.priority - nextTask.priority;

  const addTask = (msg, task) => {
    const lastReferenceTaskSection = getLastReferenceTaskSection(msg);
    lastReferenceTaskSection.push(task);
    lastReferenceTaskSection.sort(sortTaskBaseOnPriority);
  };

  const markTaskStatus = (msg, status) => {
    const lastReferenceTaskIndex = extractLastReferenceTaskIndex();

    const lastReferenceTaskSection = getLastReferenceTaskSection();

    if (lastReferenceTaskIndex === NO_TASK_REFERENCE) {
      console.log(NO_TASK_REFERENCE);
      return;
    }

    lastReferenceTaskSection[lastReferenceTaskIndex].status = status;
  };

  const editTask = (msg, editedTask) => {
    const lastReferenceTaskIndex = extractLastReferenceTaskIndex();

    if (lastReferenceTaskIndex === NO_TASK_REFERENCE) {
      console.log(NO_TASK_REFERENCE);
      return;
    }

    const lastReferenceTaskSection = getLastReferenceTaskSection();

    const lastReferenceTask = lastReferenceTaskSection[lastReferenceTaskIndex];

    const editedTaskKeys = Object.keys(editedTask);

    editedTaskKeys.forEach((key) => {
      lastReferenceTask[key] = editedTask[key];
    });

    lastReferenceTaskSection.sort(sortTaskBaseOnPriority);
  };

  const deleteTask = (msg) => {
    const lastReferenceTaskIndex = extractLastReferenceTaskIndex();

    if (lastReferenceTaskIndex === NO_TASK_REFERENCE) {
      console.log(NO_TASK_REFERENCE);
      return;
    }

    const lastReferenceTaskSection = getLastReferenceTaskSection(msg);

    if (lastReferenceTaskSection !== TASK_DELETED) {
      lastReferenceTaskSection.splice(lastReferenceTaskIndex, 1);
    }
  };

  const isSubtaskDeep = (depth) => {
    if (depth >= 50) {
      console.log(SUBTASK_DEEP);
      return SUBTASK_DEEP;
    }
  };

  const filterTaskBy = ({ tasks, key, value, depth = 0 }) => {
    if (isSubtaskDeep(depth) === SUBTASK_DEEP) {
      return;
    }

    tasks.forEach((task) => {
      if (task[key] === value) {
        console.log(task);
      }

      if (task.subtask) {
        filterTaskBy({
          tasks: task.subtask,
          key,
          value,
          depth: depth + 1
        });
      }
    });
  };

  function handleFilterTaskBy(msg, { key, value }) {
    filterTaskBy({ tasks: taskStore, key, value });
  }
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

  return { init, taskStore };
}

const taskStore = TaskStore();

export { taskStore };
