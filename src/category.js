import keys from "./constant";
import todoList from "./todo_list";

class CategoryRoot {
  constructor() {
    this[keys.inbox] = [[]];
    this[keys.myProject] = [];
  }
}

class FolderTemplate {
  constructor() {
    this._id = crypto.randomUUID();
    this._categoryPath = [...todoList.pathGet(), this._id];
  }
}

class MyProject extends FolderTemplate {
  constructor({ title }) {
    super();
    this[keys.projectTitle] = title;
    this[keys.sections] = [[]];
  }
}

class Section extends FolderTemplate {
  constructor({ title }) {
    super();
    this[keys.sectionTitle] = title;
    this[keys.tasks] = [];
  }
}

class TaskTemplate {
  constructor({ description, dueDate, status = false, priority }) {
    this._id = crypto.randomUUID();
    this.description = description;
    this.status = status;
    this.dueDate = dueDate;
    this.priority = +priority;
    this._createdAt = new Date();
    this._categoryPath = [...todoList.pathGet(), this._id];
    this._subtasks = [];
  }
}

class Task extends TaskTemplate {
  constructor({ title, description, status, dueDate, priority }) {
    super({ description, dueDate, status, priority });
    this.taskTitle = title;
  }
}

class Subtask extends TaskTemplate {
  constructor({ title, description, status, dueDate, priority }) {
    super({ description, dueDate, status, priority });
    this.subtaskTitle = title;
  }
}

export { CategoryRoot, MyProject, Section, Task, Subtask };
