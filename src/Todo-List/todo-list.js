import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

const category = Category();
const taskStore = TaskStore();

function TaskStore() {
  const init = () => {
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.CHANGE, handleTaskStoreChange);
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.ADD, addTask);
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.MARK_STATUS, markTaskStatus);
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.EDIT, editTask);
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.FILTER_BY, handleFilterTaskBy);
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_STORE.DELETE, deleteTask);

    PubSub.subscribe(
      EVENTS.TODO_LIST.TASK_INDEXES_STORE.CHANGE,
      handleTaskIndexesChange
    );
    PubSub.subscribe(EVENTS.TODO_LIST.TASK_INDEXES_STORE.ADD, addTaskIndex);
  };

  const taskStore = [];
  // The length of `taskIndexes` tracks the current task
  // The element in `taskIndexes` point to the index of the current task in it own section
  const taskIndexes = [];
  const NO_TASK_REFERENCE = "NO TASK REFERENCES THIS INDEX";
  const SUBTASK_DEEP = "SUBTASK TOO DEEP";
  const TASK_DELETED = "LAST TASK IN SECTION DELETED";

  const KEY_TASK_STORE = "taskStore";

  // ============  Task Index (Start)  =========== \\
  const getLastReferenceTaskSection = (msg) => {
    let lastReferenceTaskSection = taskStore;

    for (let i = 0; i < taskIndexes.length; i++) {
      const taskIndex = taskIndexes[i];

      const lastReferenceTask = lastReferenceTaskSection[taskIndex];

      if (msg === EVENTS.TODO_LIST.TASK_STORE.ADD) {
        if (!lastReferenceTask.subtask) lastReferenceTask.subtask = [];
        lastReferenceTaskSection = lastReferenceTask.subtask;
      } else {
        lastReferenceTaskSection = lastReferenceTask?.subtask || [];
      }

      if (msg === EVENTS.TODO_LIST.TASK_STORE.DELETE) {
        if (lastReferenceTask.subtask.length === 1) {
          delete lastReferenceTask.subtask;
          return TASK_DELETED;
        }
      }

      if (msg === EVENTS.TODO_LIST.TASK_INDEXES_STORE.ADD) {
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

  const filterTaskBy = ({ tasks, key, value, depth = 0 }) => {
    if (depth >= 50) {
      console.log(SUBTASK_DEEP);
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
    localStorage.setItem(KEY_TASK_STORE, taskStore);
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
  const getTaskStore = () => taskStore;
  // ================  Handle (Stop)  ===================== \\

  return { init, getTaskStore };
}

function Category() {
  const init = () => {
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION,
      addSectionInInbox
    );
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.CHANGE, displayCategories);
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_CATEGORY,
      addCategoryToMyProject
    );
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_SECTION,
      addSectionToCategoryInMyProject
    );

    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.CATEGORIZE, categorizeTask);
  };

  // UI will illiterate through this an get the section arrange
  const Categories = {
    Inbox: [],
    My_Project: []
  };

  //const currentCategory = { categoryTitle: "Inbox" };
  // To reference section in inbox include categoryIndex
  //const currentCategory = { categoryTitle: "Inbox", categoryIndex: [0] };

  const CATEGORY_VOID = "CATEGORY DOES NOT EXIST";
  const INBOX = "INBOX";

  // Adding section and category to `Inbox` and `My_Project`
  const addSectionInInbox = (msg, section) => {
    Categories.Inbox.push(section);
  };

  const addCategoryToMyProject = (msg, category) => {
    Categories.My_Project.push(category);
  };

  const addSectionToCategoryInMyProject = (msg, { section, categoryIndex }) => {
    const category = Categories.My_Project[categoryIndex];

    if (!category) {
      console.log(CATEGORY_VOID);
      return;
    }

    if (!category.section) {
      category.section = [];
    }

    category.section.push(section);
  };

  const displayCategories = () => {
    console.log("INBOX", Categories.Inbox);
    console.log("MY PROJECT", Categories.My_Project);
  };

  const categorizeInboxTask = (task) => {
    const sectionTitle = task.category.sectionTitle;
    if (sectionTitle) {
      for (let i = Categories.Inbox.length - 1; i >= 0; i--) {
        const categorySection = Categories.Inbox[i];
        
        if (categorySection.sectionTitle === sectionTitle) {
          if (!categorySection.section) categorySection.section = [];
          categorySection.section.push(task);
          return;
        }
      }
      Categories.Inbox.unshift(task);
    } else {
      Categories.Inbox.unshift(task);
    }
  };

  const categorizeMyProjectTask = (task) => {
    for (let i = 0; i < Categories.My_Project.length; i++) {
      const category = Categories.My_Project[i];
      
      if (category.categoryTitle === task.category.categoryTitle) {
        if (task.category.sectionTitle) {
          for (let i = category.section.length - 1; i >= 0; i--) {
            const categorySection = category.section[i];

            if (categorySection.sectionTitle === task.category.sectionTitle) {
              if (!categorySection.section) categorySection.section = [];
              categorySection.section.push(task);
              return;
            }
          }
        }
        if(!category.section) category.section = []
        category.section.unshift(task);
      }
    }
  };

  const categorizeTask = () => {
    // illiterate through the taskStore, and arrange task base on it category
    const listOfTask = taskStore.getTaskStore();

    listOfTask.forEach((task) => {
      if (task.category.categoryTitle) {
        categorizeMyProjectTask(task);
      } else {
        categorizeInboxTask(task);
      }
    });
    // fix task under it category
  };

  return { init };
}

export { taskStore, category };
