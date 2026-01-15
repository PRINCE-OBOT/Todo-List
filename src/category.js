import keys from "./constant";
import todoList from "./todo_list";

class CategoryRoot {
  constructor() {
    this[keys.inbox] = [[]];
    this[keys.myProject] = [];
  }
}

class Project {
  constructor(title) {
    this[keys.projectTitle] = title;
    this[keys.sections] = [[]];
  }
}

class Section {
  constructor(title) {
    this[keys.sectionTitle] = title;
    this[keys.tasks] = [[]];
  }
}

class TaskTemplate {
  constructor({ description, dueDate, priority }) {
    this.id = crypto.randomUUID();
    this.description = description;
    this.createdAt = new Date();
    this.dueDate = dueDate;
    this.priority = priority;
    this.categoryPath = [...todoList.pathGet(), this.id];
    this.subtasks = [];
  }
}

class Task extends TaskTemplate {
  constructor({ title, description, dueDate, priority }) {
    super({ description, dueDate, priority });
    this.taskTitle = title;
  }
}

class Subtask extends TaskTemplate {
  constructor({ title, description, dueDate, priority }) {
    super({ description, dueDate, priority });
    this.subtaskTitle = title;
  }
}

export { CategoryRoot, Project, Section, Task, Subtask };
