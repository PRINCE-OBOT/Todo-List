const CATEGORY = "CATEGORY";

const CATEGORIES = {
  TASKS: "tasks",
  SUBTASKS: "subtasks",
  SECTIONS: "sections"
};

const DATA_CAT_REF = "data-category-reference";

const sortTaskBaseOnPriority = (currentTask, nextTask) =>
  currentTask.priority - nextTask.priority;

const getCategoryKey = (category, categoryKeys) => {
  for (let i = 0; i < categoryKeys.length - 1; i++) {
    const key = categoryKeys[i];

    if (category[key]) {
      return key;
    }
  }
  return categoryKeys[categoryKeys.length - 1];
};

function CategoryReference() {
  const DEFAULT_CATEGORY_REFERENCE = ["Inbox", 0];

  const getDefault = () => DEFAULT_CATEGORY_REFERENCE;

  const categoryReferences = [...DEFAULT_CATEGORY_REFERENCE];

  const get = () => categoryReferences;

  const update = (categoryReference) => {
    get().splice(0, get().length, ...categoryReference);
    console.log(get());
  };

  return { getDefault, update, get };
}

const categoryReference = CategoryReference();

function TaskAndCategoryHandler() {
  let Categories = {
    Inbox: [[]],
    My_Project: []
  };

  const updateStorage = (msg, category) => {
    localStorage.setItem(
      CATEGORY,
      JSON.stringify(taskAndCategoryHandler.getCategories())
    );

    console.log("INBOX", taskAndCategoryHandler.getCategories().Inbox);
    console.log(
      "MY PROJECT",
      taskAndCategoryHandler.getCategories().My_Project
    );

    categoryReference.update(categoryReference.getDefault());
  };

  const getIndexOfTask = (lastReferenceTaskSection, id) =>
    lastReferenceTaskSection.findIndex((category) => {
      return category.id === id;
    });

  const getSubsection = (category) => {
    const key = getCategoryKey(category, ["sections", "tasks", "subtasks"]);

    if (!category[key]) category[key] = [];

    return category[key];
  };

  const isIndexID = (index, lastReferenceCategory) => {
    if (Number.isNaN(+index)) {
      return getIndexOfTask(lastReferenceCategory, index);
    }
    return index;
  };

  const getLastReferenceTask = () => {
    let lastReferenceCategory = Categories[categoryReference.get()[0]];

    for (let i = 1; i < categoryReference.get().length; i++) {
      let index = categoryReference.get()[i];

      index = isIndexID(index, lastReferenceCategory);

      let category = lastReferenceCategory[index];

      if (Array.isArray(category)) {
        lastReferenceCategory = category;
      } else {
        lastReferenceCategory = getSubsection(category);
      }

      if (category === undefined) return Categories.Inbox[0];
    }

    return lastReferenceCategory;
  };

  const addTask = (task) => {
    task.category = [...categoryReference.get(), task.id];

    const lastReferenceTask = getLastReferenceTask();

    lastReferenceTask.push(task);
    lastReferenceTask.sort(sortTaskBaseOnPriority);

    updateStorage();
    label.add(task);
  };

  const deleteTask = () => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    lastReferenceTaskSection.splice(
      getIndexOfTask(lastReferenceTaskSection, id),
      1
    );

    updateStorage();
  };

  const markTask = (status) => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    const task =
      lastReferenceTaskSection[getIndexOfTask(lastReferenceTaskSection, id)];

    task.status = status;

    updateStorage();
  };

  const editTask = (editedTask) => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    const task =
      lastReferenceTaskSection[getIndexOfTask(lastReferenceTaskSection, id)];

    if (task.category === editedTask.category || !editedTask.category) {
      const editedTaskKeys = Object.keys(editedTask);

      editedTaskKeys.forEach((key) => {
        task[key] = editedTask[key];
      });

      lastReferenceTaskSection.sort(sortTaskBaseOnPriority);

      updateStorage();
      label.add(task);
    } else {
      if (task.subtasks) {
        editedTask.subtask = task.subtask;
      }

      deleteTask();
      categoryReference.update(editedTask.category);
      addTask(editedTask);
    }
  };

  const addCategory = (category) => {
    const lastReferenceCategory = getLastReferenceTask();

    lastReferenceCategory.push(category);

    updateStorage();
  };

  const setCategory = (categoriesInStorage) => {
    Categories = categoriesInStorage;
  };

  const getTask = () => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    const task =
      lastReferenceTaskSection[getIndexOfTask(lastReferenceTaskSection, id)];

    return task;
  };

  const getCategories = () => Categories;

  return {
    addTask,
    editTask,
    deleteTask,
    getTask,
    markTask,
    getCategories,
    setCategory,
    addCategory
  };
}

const taskAndCategoryHandler = TaskAndCategoryHandler();

const hasTitle = (category, filterKey, filterValue, callback) => {
  if (category.title) {
    const filterKeyValue = category[filterKey];
    if (filterKeyValue) {
      if (filterKeyValue.toLowerCase().includes(filterValue.toLowerCase())) {
        callback(category);
      }
    } else {
      callback(category);
    }
  }
};

const filterTasks = (categories, filterKey, filterValue, callback) => {
  categories.forEach((category) => {
    if (Array.isArray(category)) {
      filterTasks(category, filterKey, filterValue, callback);
    } else {
      hasTitle(category, filterKey, filterValue, callback);

      const key = getCategoryKey(category, ["sections", "tasks"]);

      if (category[key]) {
        filterTasks(category[key], filterKey, filterValue, callback);
      }
    }
  });
};

function Path() {
  const getLastIndexOfNumber = (categoryReference) =>
    categoryReference.findLastIndex((reference) => Number.isInteger(reference));

  const constructCategoryReference = (task) => {
    if (Array.isArray(task)) return task;

    const pathStringFormat = task.getAttribute(DATA_CAT_REF);

    return pathStringFormat
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));
  };

  const getTasksID = () => {
    return categoryReference
      .get()
      .slice(getLastIndexOfNumber(categoryReference.get()) + 1);
  };

  const generateCategory = (task) => {
    const referenceArrayFormat = constructCategoryReference(task);

    const categoryPathReference = referenceArrayFormat.slice(
      0,
      getLastIndexOfNumber(referenceArrayFormat) + 1
    );

    let categoryPath = categoryPathReference[0];

    const root = categoryPath;

    let category = taskAndCategoryHandler.getCategories()[root];

    for (let i = 1; i < categoryPathReference.length; i++) {
      const index = categoryPathReference[i];

      const key = category[index].categoryTitle
        ? "categoryTitle"
        : "sectionTitle";

      if (!category[index][key]) return categoryPath;

      categoryPath += ` / ${category[index][key]}`;

      const subsectionKey = getCategoryKey(category[index], [
        "sections",
        "tasks"
      ]);

      category = category[index][subsectionKey];
    }
    return categoryPath;
  };

  return {
    getLastIndexOfNumber,
    generateCategory,
    constructCategoryReference,
    getTasksID
  };
}

const path = Path();

function Label() {
  const labels = [];

  const get = () => labels;

  const add = (category) => {
    const labels = get();

    if (!labels.includes(category.label)) {
      labels.push(category.label);
    }
  };

  return { add, get };
}

const label = Label();

(function initializeCategory() {
  const categories = localStorage.getItem(CATEGORY);

  if (!categories) return;

  taskAndCategoryHandler.setCategory(JSON.parse(categories));
})();

export {
  CATEGORIES,
  CATEGORY,
  filterTasks,
  taskAndCategoryHandler,
  sortTaskBaseOnPriority,
  getCategoryKey,
  categoryReference,
  label,
  path
};
