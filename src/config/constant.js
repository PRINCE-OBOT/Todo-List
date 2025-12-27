const CATEGORY = "CATEGORY";

const CATEGORIES = {
  TASKS: "tasks",
  SUBTASKS: "subtasks",
  SECTIONS: "sections"
};

const DATA_CAT_REF = "data-category-reference";

const sortTaskBaseOnPriority = (currentTask, nextTask) =>
  currentTask.priority - nextTask.priority;

function CategoryReference() {
  const DEFAULT_CATEGORY_REFERENCE = ["Inbox", 0];

  const getDefault = () => DEFAULT_CATEGORY_REFERENCE;

  const categoryReferences = DEFAULT_CATEGORY_REFERENCE;

  const get = () => categoryReferences;

  const update = (categoryReference) => {
    categoryReferences.splice(
      0,
      categoryReferences.length,
      ...categoryReference
    );
    console.log(categoryReferences);
  };

  return { getDefault, update, get };
}

const categoryReference = CategoryReference();

function TaskAndCategoryHandler() {
  let Categories = {
    Inbox: [[]],
    My_Project: []
  };

  const isCategoryExist = () => {
    const categoryReferenceIndex = categoryReference.get().pop();

    const category =
      taskAndCategoryHandler.getCategories().My_Project[categoryReferenceIndex];

    if (!category) {
      console.log(CATEGORY_VOID);
      return CATEGORY_VOID;
    }
    return category;
  };

  const addTask = (task) => {
    task.category = [...categoryReference.get(), task.id];

    const lastReferenceTask = getLastReferenceTask();

    lastReferenceTask.push(task);
    lastReferenceTask.sort(sortTaskBaseOnPriority);
  };

  const deleteTask = () => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    lastReferenceTaskSection.splice(
      getIndexOfTask(lastReferenceTaskSection, id),
      1
    );
  };

  const markTask = (status) => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    const task =
      lastReferenceTaskSection[getIndexOfTask(lastReferenceTaskSection, id)];

    task.status = status;
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
    } else {
      if (task.subtasks) {
        editedTask.subtask = task.subtask;
      }

      deleteTask(EVENTS.TODO_LIST.CATEGORY.DELETE);

      categoryReference.update(editedTask.category);

      addTask(EVENTS.TODO_LIST.CATEGORY.ADD, editedTask);
    }
  };

  const addSectionInInbox = (section) => {
    taskAndCategoryHandler.getCategories().Inbox.push(section);
  };

  const addSectionToCategoryInMyProject = (_, section) => {
    const category = isCategoryExist();
    if (category === CATEGORY_VOID) return;

    if (!category.sections) {
      category.sections = [];
    }
    category.sections.push(section);
  };

  const addTaskToMyProject = (category) => {
    category.sections = [[]];
    taskAndCategoryHandler.getCategories().My_Project.push(category);
  };

  const storageChange = (msg, category) => {
    localStorage.setItem(
      CATEGORY,
      JSON.stringify(taskAndCategoryHandler.getCategories())
    );

    console.log("INBOX", taskAndCategoryHandler.getCategories().Inbox);
    console.log("MY PROJECT", taskAndCategoryHandler.getCategories().My_Project);

    categoryReference.update(categoryReference.getDefault());

    label.add(category);
  };

  const setCategory = (categoriesInStorage) => {
    Categories = categoriesInStorage;
  };

  const getIndexOfTask = (lastReferenceTaskSection, id) =>
    lastReferenceTaskSection.findIndex((category) => {
      return category.id === id;
    });

  const getLastReferenceTask = () => {
    let lastReferenceCategory = Categories[categoryReference.get()[0]];

    for (let i = 1; i < categoryReference.get().length; i++) {
      let indexOfCategory = categoryReference.get()[i];

      if (Number.isNaN(+indexOfCategory)) {
        indexOfCategory = getIndexOfTask(
          lastReferenceCategory,
          indexOfCategory
        );
      }

      let category = lastReferenceCategory[indexOfCategory];

      if (Array.isArray(category)) {
        lastReferenceCategory = category;
      } else {
        const subSection = category.categoryTitle
          ? CATEGORIES.SECTIONS
          : category.sectionTitle
          ? CATEGORIES.TASKS
          : CATEGORIES.SUBTASKS;

        if (!category[subSection]) category[subSection] = [];

        lastReferenceCategory = category[subSection];
      }

      if (category === undefined) return Categories.Inbox[0];
    }

    return lastReferenceCategory;
  };

  const getTask = () => {
    const id = categoryReference.get().pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    const task =
      lastReferenceTaskSection[getIndexOfTask(lastReferenceTaskSection, id)];

    return task;
  };

  const getCategories = () => Categories;

  return { addTask, editTask, getTask, getCategories, setCategory };
}

const taskAndCategoryHandler = TaskAndCategoryHandler();

const getTasks = (categories, filterKey, filterValue, callback) => {
  categories.forEach((category) => {
    if (Array.isArray(category)) {
      getTasks(category, filterKey, filterValue, callback);
    } else {
      const categorySectionKey = category.categoryTitle
        ? CATEGORIES.SECTIONS
        : CATEGORIES.TASKS;

      if (category.title) {
        if (category[filterKey] === filterValue) {
          callback(category);
        }
      }

      if (category.subtitle) {
        // labels;
      }

      if (category[categorySectionKey]) {
        getTasks(
          category[categorySectionKey],
          filterKey,
          filterValue,
          callback
        );
      }
    }
  });
};

function Path() {
  const getLastIndexOfNumber = (categoryReference) =>
    categoryReference.findLastIndex((reference) => Number.isInteger(reference));

  const constructCategoryReference = (task) => {
    const pathStringFormat = task.getAttribute(DATA_CAT_REF);

    return pathStringFormat
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));
  };

  const getTasksID = () => {
    return categoryReference
      .get()
      .slice(getLastIndexOfNumber(categoryReference.get())+1);
  };

  const generateCategory = (task) => {
    const referenceArrayFormat = constructCategoryReference(task);

    const categoryPathReference = referenceArrayFormat.slice(
      0,
      getLastIndexOfNumber(referenceArrayFormat) + 1
    );

    let categoryPath = "";
    let category = taskAndCategoryHandler.getCategories();

    for (let i = 0; i < categoryPathReference.length; i++) {
      const reference = categoryReference.get()[i];

      if (reference === 0) return categoryPath;

      category = category[reference];

      if (i === 0) {
        categoryPath += reference;
      } else {
        const key = category.categoryTitle ? "categoryTitle" : "sectionTitle";

        if (!category[key]) return categoryPath;

        categoryPath += ` / ${category[key]}`;
      }
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
  getTasks,
  taskAndCategoryHandler,
  sortTaskBaseOnPriority,
  categoryReference,
  label,
  path
};
