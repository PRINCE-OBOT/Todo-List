import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

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
    PubSub.subscribe(
      EVENTS.TODO_LIST.CATEGORY.DISPLAY_FILTER,
      handleFilterTaskBy
    );
  };

  /*
  Double array like this [[]], means the first index is kept aside for task, and `category` with `sectionTitle` or `categoryTitle` can be pushed in the other index
  */
  const Categories = {
    Inbox: [[]],
    My_Project: []
  };

  const SUBTASKS = "subtasks";
  const TASKS = "tasks";
  const SECTIONS = "sections";

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

  /*
  Use the path provided via the `categoryReferences` and target the category that was reference last
  (category reference last could be, category, section, task - task is also classified as category because it can contain subtask)

  If the path is incorrect, then use the Category.Inbox category (array)
  */
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

  /*
  Check if the task edited now has a different category,
  If it does not, just update the existing task value to the edited task value
  else  delete the category in the old category and add it in the new category
  */
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

  const filterTaskBy = (categories, filterKey, filterValue) => {
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        filterTaskBy(category, filterKey, filterValue);
      } else {
        const categorySectionKey = category.categoryTitle
          ? SECTIONS
          : category.sectionTitle
          ? TASKS
          : SUBTASKS;

        if (category.title) {
          if (category[filterKey] === filterValue) {
            console.log(category);
          }
        }

        if (category[categorySectionKey]) {
          filterTaskBy(category[categorySectionKey], filterKey, filterValue);
        }
      }
    });
  };

  function handleFilterTaskBy(msg, { filterKey, filterValue }) {
    for (let key in Categories) {
      filterTaskBy(Categories[key], filterKey, filterValue);
    }
  }

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

  const displayCategories = () => {
    console.log("INBOX", Categories.Inbox);
    console.log("MY PROJECT", Categories.My_Project);
    categoryReferences = DEFAULT_REFERENCE;
  };

  return { init };
}

const category = Category();

export { category };


