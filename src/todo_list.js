import keys from "./constant";
import storage from "./storage";

class TodoList {
  constructor() {
    this.path = [];
  }

  #findIndex(categories, id) {
    return categories.findIndex((category) => category._id === id);
  }

  getSubsequentArrOfCategory(todoListObj) {
    const lastPath = this.path.pop();
    const subsequentArrOfCategory = this.getArrOfCategory(todoListObj);

    const index = Number.isNaN(+lastPath)
      ? this.#findIndex(subsequentArrOfCategory, lastPath)
      : lastPath;

    this.path.push(lastPath);

    return { index, subsequentArrOfCategory };
  }

  #getKey(category, categoryKeys) {
    for (let i = 0; i < categoryKeys.length; i++) {
      const key = categoryKeys[i];

      if (category[key]) {
        return key;
      }
    }

    return undefined;
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
  getArrOfCategory(todoListObj) {
    let categories = todoListObj[this.path[0]];

    for (let i = 1; i < this.path.length; i++) {
      const index = Number.isNaN(+this.path[i])
        ? this.#findIndex(categories, this.path[i])
        : this.path[i];

      const category = categories[index];

      if (Array.isArray(category)) {
        categories = category;
      } else {
        const key = this.#getKey(category, [
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

  add(categoryObj) {
    const todoListObj = storage.get(keys.todo_list);

    const arrOfCategory = this.getArrOfCategory(todoListObj);

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

  delete() {
    const todoListObj = storage.get(keys.todo_list);

    const { index, subsequentArrOfCategory } =
      this.getSubsequentArrOfCategory(todoListObj);

    subsequentArrOfCategory.splice(index, 1);

    storage.set(keys.todo_list, todoListObj);
  }

  edit(taskValue) {
    const todoListObj = storage.get(keys.todo_list);

    const taskObj = this.get(todoListObj);

    for (const key in taskValue) {
      if (!key.startsWith("_")) {
        taskObj[key] = taskValue[key];
      }
    }

    storage.set(keys.todo_list, todoListObj);
  }

  get(todoListObj) {
    const { index, subsequentArrOfCategory } =
      this.getSubsequentArrOfCategory(todoListObj);

    return subsequentArrOfCategory[index];
  }

  getCategoryLen() {
    return this.getArrOfCategory(storage.get(keys.todo_list)).length;
  }

  sortPriority(current, next) {
    return current.priority - next.priority;
  }

  filter(categories, key, value, callback) {
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        this.filter(category, key, value, callback);
      } else {
        this.#isTask(category, key, value, callback);

        const categoryKey = this.#getKey(category, [keys.sections, keys.tasks]);

        if (category[categoryKey]) {
          this.filter(category[categoryKey], key, value, callback);
        }
      }
    });
  }

  pathDefault() {
    this.path = [keys.inbox];
  }

  pathLast() {
    return this.path[this.path.length - 1];
  }

  pathFirst() {
    return this.path[0];
  }

  pathTaskIDLength() {
    const lastNumIndex = this.path.findLastIndex((path) =>
      Number.isInteger(path)
    );

    return lastNumIndex === -1
      ? lastNumIndex
      : this.path.slice(lastNumIndex + 1).length;
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

  pathFormat(categoryPath) {
    const path = categoryPath ? categoryPath : this.path;

    const todoListObj = storage.get(keys.todo_list);

    let categories = todoListObj[path[0]];

    let pathStr = path[0];

    for (let i = 1; i < path.length; i++) {
      const index = Number.isNaN(+path[i])
        ? this.#findIndex(categories, path[i])
        : path[i];

      if (Array.isArray(categories[index])) {
        categories = categories[index];
      } else {
        const key = this.#getKey(categories[index], [
          keys.projectTitle,
          keys.sectionTitle
        ]);

        if (!categories[index][key]) return pathStr;

        pathStr += ` / ${categories[index][key]}`;

        const subsectionKey = this.#getKey(categories[index], [
          keys.sections,
          keys.tasks
        ]);

        categories = categories[index][subsectionKey];
      }
    }

    return pathStr;
  }
}

const todoList = new TodoList();

export default todoList;
