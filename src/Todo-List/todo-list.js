import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

const category = Category();

function Category() {
  const init = () => {
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION,
      addSectionInInbox
    );

    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.CHANGE, displayCategories);

    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_CATEGORY,
      addTaskCategoryToMyProject
    );

    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_SECTION,
      addSectionToCategoryInMyProject
    );

    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.ADD, addTaskCategory);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.DELETE, deleteTaskCategory);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.MARK, markCategoryStatus);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.EDIT, editCategory);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.REFERENCE, referenceCategory);
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.DISPLAY_ALL,
      handleDisplayAllCategory
    );
  };

  // The first category in the array is classified as the category
  // if the first index is not in the Categories key, then it get added to the inbox first index array
  const Categories = {
    Inbox: [[]],
    My_Project: []
  };

  const Inbox = "Inbox";
  const My_Project = "My_Project";
  const SUBTASKS = "subtasks";
  const TASKS = "tasks";
  const SECTIONS = "sections";
  const My_Project_Maximum_Category = 3;

  const DEFAULT_REFERENCE = "Inbox>0".split(">");
  let categoryReferences = DEFAULT_REFERENCE;

  const referenceCategory = (_, categoryReference) => {
    categoryReferences = categoryReference.split(">");
    console.log(categoryReferences);
  };

  const CATEGORY_VOID = "CATEGORY DOES NOT EXIST";
  const VALUE_NOT_ACCEPTED = "CATEGORY NOT DELETABLE";
  const TASK_DELETED = "LAST TASK IN SECTION DELETED";

  // Utility Function
  const getLastReference = (
    msg,
    lastReferenceCategory,
    indexOfCategoryReferenceLast,
    key
  ) => {
    const category = lastReferenceCategory[indexOfCategoryReferenceLast][key];

    if (msg === EVENTS.TODO_LIST.CATEGORY.DELETE) {
      if (category.length === 1)
        delete lastReferenceCategory[indexOfCategoryReferenceLast][key];
      return TASK_DELETED;
    }

    if (!category) {
      lastReferenceCategory[indexOfCategoryReferenceLast][key] = [];
    }

    return lastReferenceCategory[indexOfCategoryReferenceLast][key];
  };

  const getLastReferenceCategory = (msg) => {
    let lastReferenceCategory = Categories[categoryReferences[0]];

    for (let i = 1; i < categoryReferences.length; i++) {
      const indexOfCategoryReferenceLast = +categoryReferences[i];

      const category = lastReferenceCategory[indexOfCategoryReferenceLast];

      if (Array.isArray(category)) {
        lastReferenceCategory = category;
      } else {
        const key = category.categoryTitle
          ? SECTIONS
          : category.sectionTitle
          ? TASKS
          : SUBTASKS;

        lastReferenceCategory = getLastReference(
          msg,
          lastReferenceCategory,
          indexOfCategoryReferenceLast,
          key
        );
      }
    }

    return lastReferenceCategory === Categories.Inbox
      ? Categories.Inbox[0]
      : lastReferenceCategory;
  };

  const isCategoryExist = () => {
    const categoryReferenceIndex = +categoryReferences.pop();

    const category = Categories.My_Project[categoryReferenceIndex];

    if (!category) {
      console.log(CATEGORY_VOID);
      return CATEGORY_VOID;
    }
    return category;
  };

  const handleLastReferenceCategory = (msg) => {
    const indexOfCategoryReferenceLast = +categoryReferences.pop();

    if (Number.isNaN(indexOfCategoryReferenceLast)) {
      console.log(VALUE_NOT_ACCEPTED);
      return VALUE_NOT_ACCEPTED;
    }

    const lastReferenceCategory = getLastReferenceCategory(msg);

    return { lastReferenceCategory, indexOfCategoryReferenceLast };
  };

  const sortTaskBaseOnPriority = (currentTask, nextTask) =>
    currentTask.priority - nextTask.priority;

  // Main Function
  const addTaskCategory = (msg, task) => {
    task.category = categoryReferences;
    const lastReferenceCategory = getLastReferenceCategory(msg);
    lastReferenceCategory.push(task);
    lastReferenceCategory.sort(sortTaskBaseOnPriority);
  };

  const deleteTaskCategory = (msg) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    if (lastReferenceCategoryValue === VALUE_NOT_ACCEPTED) return;

    const { lastReferenceCategory, indexOfCategoryReferenceLast } =
      lastReferenceCategoryValue;

    if (lastReferenceCategory !== TASK_DELETED) {
      lastReferenceCategory.splice(indexOfCategoryReferenceLast, 1);
    }
  };

  const markCategoryStatus = (msg, status) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    if (lastReferenceCategoryValue === VALUE_NOT_ACCEPTED) return;

    const { lastReferenceCategory, indexOfCategoryReferenceLast } =
      lastReferenceCategoryValue;

    const task = lastReferenceCategory[indexOfCategoryReferenceLast].status;

    if (task === undefined) {
      console.log(VALUE_NOT_ACCEPTED);
      return;
    }

    lastReferenceCategory[indexOfCategoryReferenceLast].status = status;
  };

  const editCategory = (msg, editedTask) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    if (lastReferenceCategoryValue === VALUE_NOT_ACCEPTED) return;

    const { lastReferenceCategory, indexOfCategoryReferenceLast } =
      lastReferenceCategoryValue;

    const task = lastReferenceCategory[indexOfCategoryReferenceLast];

    if (task.Category === editedTask.category) {
      const editedTaskKeys = Object.keys(editedTask);

      editedTaskKeys.forEach((key) => {
        task[key] = editedTask[key];
      });

      lastReferenceCategory.sort(sortTaskBaseOnPriority);
    } else {
      if (task.subtask) {
        editedTask.subtask = task.subtask;
      }

      deleteTaskCategory(EVENTS.TODO_LIST.CATEGORY.DELETE);

      categoryReferences = editedTask.category;

      addTaskCategory(EVENTS.TODO_LIST.CATEGORY.ADD, editedTask);
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

  const displayAllCategory = (categories, subtaskIndentLevel = []) => {
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        displayAllCategory(category, subtaskIndentLevel);
      } else {
        const key = category.categoryTitle
          ? SECTIONS
          : category.sectionTitle
          ? TASKS
          : SUBTASKS;

        if (key === SUBTASKS) {
          subtaskIndentLevel.push(0);
          console.log(category, subtaskIndentLevel.length);
        }

        if (category[key]) {
          displayAllCategory(category[key], subtaskIndentLevel);
        }
      }
    });
  };

  const handleDisplayAllCategory = () => {
    for (let key in Categories) {
      console.log(key);
      displayAllCategory(Categories[key]);
    }
  };

  const addSectionInInbox = (_, section) => {
    Categories.Inbox.push(section);
  };

  const addTaskCategoryToMyProject = (_, category) => {
    Categories.My_Project.push(category);
  };

  const addSectionToCategoryInMyProject = (_, section) => {
    const category = isCategoryExist();
    if (category === CATEGORY_VOID) return;

    if (!category.sections) {
      category.sections = [];
    }
    category.sections.push(section);
  };

  const displayCategories = () => {
    console.log("INBOX", Categories.Inbox);
    console.log("MY PROJECT", Categories.My_Project);
    categoryReferences = DEFAULT_REFERENCE;
  };

  return { init };
}

export { category };

/*How to use Todo-list with console
1.  To add task (By default task are added in the inbox)
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD, { title: 'one', description: 'Go to gym as early as possible', status: false, priority: 1, label: 'exercise' });

2.  To add task in any category - reference that category
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, 'Inbox>1');
    The category in index one of the `inbox` is been reference here

3.  To add a section to inbox  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION, { sectionTitle: 'gym'});

4.  To add a category to my_project  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_CATEGORY, { categoryTitle: 'gym'});

5.  To add a section to my_project  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_SECTION, { sectionTitle: 'gym'});

6.  To display all category, include task  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DISPLAY_ALL);
*/
