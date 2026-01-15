import keys from "./constant";
import storage from "./storage";

const CATEGORY = "CATEGORY";

const CATEGORIES = {
  TASKS: "tasks",
  SUBTASKS: "subtasks",
  SECTIONS: "sections"
};

const DATA_CAT_REF = "data-category-reference";

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

  const getLastReferenceTask = () => {};

  const addTask = (task) => {};

  const deleteTask = () => {
    let index = this.path.pop();

    const lastReferenceTaskSection = getLastReferenceTask();

    index = isIndexID(index, lastReferenceTaskSection);

    lastReferenceTaskSection.splice(index, 1);

    updateStorage();
  };

  const markTask = (status) => {};

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

function Path() {
  const constructCategoryReference = (elemWithCatRef) => {
    if (Array.isArray(elemWithCatRef)) return elemWithCatRef;

    const pathStringFormat = elemWithCatRef.getAttribute(DATA_CAT_REF);

    return pathStringFormat
      .split(",")
      .map((index) => (Number.isNaN(+index) ? index : +index));
  };

  const getTasksID = () => {
    return categoryReference
      .get()
      .slice(getLastIndexOfNumber(categoryReference.get()) + 1);
  };

  const generateCategory = (elemWithCategoryRef) => {
    const referenceArrayFormat = elemWithCategoryRef
      ? constructCategoryReference(elemWithCategoryRef)
      : categoryReference.get();
  };

  return {
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

const categoryTypeHandler = {
  category: (value) => {
    categoryReference.update(["My_Project"]);

    taskAndCategoryHandler.addCategory({
      categoryTitle: value,
      sections: [[]]
    });
  },
  section: (value, index, root) => {
    const categoryRef = [root];

    if (index !== "undefined") {
      categoryRef.push(index);
    }

    categoryReference.update(categoryRef);

    taskAndCategoryHandler.addCategory({
      sectionTitle: value,
      tasks: [[]]
    });
  }
};

(function initializeCategory() {
  const categories = localStorage.getItem(CATEGORY);

  if (!categories) return;

  taskAndCategoryHandler.setCategory(JSON.parse(categories));
})();

export {
  CATEGORIES,
  CATEGORY,
  taskAndCategoryHandler,
  categoryReference,
  categoryTypeHandler,
  label,
  path
};

class TodoList {
  constructor() {
    this.path = [];
  }

  #findIndex(categories, id) {
    return categories.findIndex((category) => category.id === id);
  }

  #getArrOfCategory(todoListObj) {
    let categories = todoListObj[this.path[0]];

    for (let i = 1; i < this.path.length; i++) {
      const index = Number.isNaN(+this.path[i])
        ? this.#findIndex(categories, this.path[i])
        : this.path[i];

      const category = categories[index];

      if (Array.isArray(category)) {
        categories = category;
      } else {
        const key = this.#getCategoryKey(category, [
          keys.sections,
          keys.tasks,
          keys.subtasks
        ]);

        categories = category[key];
      }

      if (!category) {
        return todoListObj[keys.inbox][0];
      }
    }

    return categories;
  }

  #getSubsequentArrOfCategory(todoListObj) {
    const lastPath = this.path.pop();
    const subsequentArrOfCategory = this.#getArrOfCategory(todoListObj);

    const index = Number.isNaN(+lastPath)
      ? this.#findIndex(subsequentArrOfCategory, lastPath)
      : lastPath;

    this.path.push(lastPath);

    return { index, subsequentArrOfCategory };
  }

  #getCategoryKey(category, categoryKeys) {
    for (let i = 0; i < categoryKeys.length - 1; i++) {
      const key = categoryKeys[i];

      if (category[key]) {
        return key;
      }
    }
    return categoryKeys[categoryKeys.length - 1];
  }

  #isTask(category, key, value, callback) {
    if (category[keys.taskTitle]) {
      const keyValue = category[key];
      if (keyValue) {
        if (keyValue.toLowerCase().includes(value.toLowerCase())) {
          callback(category);
        }
      } else {
        callback(category);
      }
    }
  }

  add(categoryObj) {
    const todoListObj = storage.get(keys.todo_list);

    const arrOfCategory = this.#getArrOfCategory(todoListObj);

    arrOfCategory.push(categoryObj);

    arrOfCategory.sort(this.sortPriority);

    storage.set(keys.todo_list, todoListObj);
  }

  mark(status) {
    const todoListObj = storage.get(keys.todo_list);

    const taskObj = this.get(todoListObj);

    taskObj.status = status;

    storage.set(keys.todo_list, todoListObj);
  }

  get(todoListObj) {
    const { index, subsequentArrOfCategory } =
      this.#getSubsequentArrOfCategory(todoListObj);

    return subsequentArrOfCategory[index];
  }

  sortPriority(current, next) {
    return current.priority - next.priority;
  }

  filter(rootArr, key, value, callback) {
    rootArr.forEach((category) => {
      if (Array.isArray(category)) {
        this.filter(category, key, value, callback);
      } else {
        this.#isTask(category, key, value, callback);

        const categoryKey = this.#getCategoryKey(category, [
          keys.sections,
          keys.tasks
        ]);

        if (category[categoryKey]) {
          this.filter(category[categoryKey], key, value, callback);
        }
      }
    });
  }

  pathDefault() {
    this.path = [keys.inbox, 0];
  }

  pathLast() {
    return this.path[this.path.length - 1];
  }

  pathUpdate(categoryPath) {
    const path = Array.isArray(categoryPath)
      ? categoryPath
      : categoryPath
          .split(",")
          .map((path) => (Number.isNaN(+path) ? path : +path));

    this.path = [...path];
    console.log(this.path);
  }

  pathAdd(path) {
    this.path.push(path);
  }

  pathGet() {
    return this.path;
  }

  pathFormat() {
    const root = this.path[0];

    const todoListObj = storage.get(keys.todo_list);

    let categories = todoListObj[root];

    let path = root;

    for (let i = 1; i < categories.length; i++) {
      const index = this.path[i];

      const key = this.#getCategoryKey(categories[index], [
        keys.projectTitle,
        keys.sectionTitle
      ]);

      if (!categories[index][key]) return path;

      path += ` / ${categories[index][key]}`;

      const subsectionKey = getCategoryKey(categories[index], [
        keys.sections,
        keys.tasks
      ]);

      categories = categories[index][subsectionKey];
    }

    return path;
  }
}

const todoList = new TodoList();

export default todoList;
