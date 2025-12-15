import { CATEGORIES } from "../config/constant";
import EVENTS from "../config/EVENTS";
import PubSub from "pubsub-js";

const category = Category();

function Category() {
  const init = () => {
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION,
      addSectionInInbox
    );

    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.CHANGE, updateStorage);

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
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.GET_TASK, getTask);
    PubSub.subscribe(EVENTS.TODO_LIST.CATEGORY.REFERENCE, referenceCategory);
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.DISPLAY_ALL,
      handleDisplayAllCategory
    );

    initializeCategory();
  };

  const CATEGORY = "CATEGORY";

  const DEFAULT_REFERENCE = ["Inbox", 0];
  let categoryReferences = DEFAULT_REFERENCE;

  // The first category in the array is classified as the category
  // if the first index is not in the Categories key, then it get added to the inbox first index array
  let Categories = {
    Inbox: [[]],
    My_Project: []
  };

  function initializeCategory() {
    const categories = localStorage.getItem(CATEGORY);

    if (!categories) return;

    Categories = JSON.parse(categories);
  }

  const referenceCategory = (_, categoryReference) => {
    categoryReferences.splice(
      0,
      categoryReferences.length,
      ...categoryReference
    );
    console.log(categoryReferences);
  };

  const CATEGORY_VOID = "CATEGORY DOES NOT EXIST";
  const TASK_DELETED = "LAST TASK IN SECTION DELETED";

  // Utility Function
  const getLastReference = (
    msg,
    lastReferenceCategory,
    indexOfCategoryReferenceLast,
    key
  ) => {
    const category = lastReferenceCategory[indexOfCategoryReferenceLast][key];

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

      if (category === undefined) return Categories.Inbox[0];

      if (Array.isArray(category)) {
        lastReferenceCategory = category;
      } else {
        const key = category.categoryTitle
          ? CATEGORIES.SECTIONS
          : category.sectionTitle
          ? CATEGORIES.TASKS
          : CATEGORIES.SUBTASKS;

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

  const getCategoryIndex = (lastReferenceCategory, id) =>
    lastReferenceCategory.findIndex((category) => category.id === id);

  const isCategoryExist = () => {
    const categoryReferenceIndex = categoryReferences.pop();

    const category = Categories.My_Project[categoryReferenceIndex];

    if (!category) {
      console.log(CATEGORY_VOID);
      return CATEGORY_VOID;
    }
    return category;
  };

  const handleLastReferenceCategory = (msg) => {
    const id = categoryReferences.pop();

    const lastReferenceCategory = getLastReferenceCategory(msg);

    return { lastReferenceCategory, id };
  };

  const getTask = (msg, taskSection) => {
    const { lastReferenceCategory, id } = handleLastReferenceCategory(msg);
    const indexOfCategory = getCategoryIndex(lastReferenceCategory, id);

    PubSub.publish(EVENTS.TODO_LIST.CATEGORY.VIEW_TASK_DIALOG, {
      category: lastReferenceCategory[indexOfCategory],
      taskSection
    });
    
    categoryReferences.push(id);
  };

  const sortTaskBaseOnPriority = (currentTask, nextTask) =>
    currentTask.priority - nextTask.priority;

  // Main Function
  const addTaskCategory = (msg, task) => {
    task.category = [...categoryReferences, task.id];

    const lastReferenceCategory = getLastReferenceCategory(msg);
    lastReferenceCategory.push(task);
    lastReferenceCategory.sort(sortTaskBaseOnPriority);
  };

  const deleteTaskCategory = (msg) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    const { lastReferenceCategory, id } = lastReferenceCategoryValue;

    if (lastReferenceCategory !== TASK_DELETED) {
      const indexOfCategory = getCategoryIndex(lastReferenceCategory, id);
      lastReferenceCategory.splice(indexOfCategory, 1);
    }
  };

  const markCategoryStatus = (msg, status) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    const { lastReferenceCategory, id } = lastReferenceCategoryValue;

    const indexOfCategory = getCategoryIndex(lastReferenceCategory, id);

    lastReferenceCategory[indexOfCategory].status = status;
  };

  const editCategory = (msg, editedTask) => {
    const lastReferenceCategoryValue = handleLastReferenceCategory(msg);

    const { lastReferenceCategory, id } = lastReferenceCategoryValue;

    const indexOfCategory = getCategoryIndex(lastReferenceCategory, id);

    const task = lastReferenceCategory[indexOfCategory];

    if (task.Category === editedTask.category || !editedTask.category) {
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

  const displayAllCategory = (categories, subtaskIndentLevel = 0) => {
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        displayAllCategory(category, subtaskIndentLevel);
      } else {
        const categorySectionKey = category.categoryTitle
          ? SECTIONS
          : category.sectionTitle
          ? TASKS
          : SUBTASKS;

        console.log(subtaskIndentLevel);
        console.log(category);

        if (category.subtasks) {
          subtaskIndentLevel++;
        }

        if (category[categorySectionKey]) {
          displayAllCategory(category[categorySectionKey], subtaskIndentLevel);
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
    category.sections = [[]];
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

  const updateStorage = () => {
    localStorage.setItem(CATEGORY, JSON.stringify(Categories));

    console.log("INBOX", Categories.Inbox);
    console.log("MY PROJECT", Categories.My_Project);
    categoryReferences = DEFAULT_REFERENCE;
  };

  const getCategories = () => Categories;

  return { init, getCategories };
}

export { category };

/*How to use Todo-list with console
1.  To add task (By default task are added in the inbox)
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD, { title: 'one', description: 'Go to gym as early as possible', status: false, priority: 1, label: 'exercise' });

2.  To add task in any category - reference that category
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, 'Inbox>1');
      
      The category in index 1 of `inbox`  is been reference here
      Note: If a category is not reference correctly, the `inbox` categories (array) is used


3.  To add a section to inbox  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION, { sectionTitle: 'gym'});

4.  To add a category to my_project  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_CATEGORY, { categoryTitle: 'gym'});

5.  To add a section to my_project  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_SECTION, { sectionTitle: 'gym'});

6.  To display all category, include task  
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DISPLAY_ALL);

7.  To display only filtered task
      PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DISPLAY_FILTER, { filterKey: 'title', filterValue: 'Hockey' });
*/
