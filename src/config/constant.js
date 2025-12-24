const DATA_CAT_REF = "data-category-reference";

let Categories = {
  Inbox: [[]],
  My_Project: []
};

const CATEGORIES = {
  TASKS: "tasks",
  SUBTASKS: "subtasks",
  SECTIONS: "sections"
};

const Context = {
  NEW: "NEW",
  OLD: "OLD"
};

const CATEGORY = "CATEGORY";


(function initializeCategory() {
  const categories = localStorage.getItem(CATEGORY);

  if (!categories) return;

  Categories = JSON.parse(categories);
})();

const getTasks = (categories, callback) => {
  categories.forEach((category) => {
    if (Array.isArray(category)) {
      getTasks(category, callback,);
    } else {
      const categorySectionKey = category.categoryTitle
        ? CATEGORIES.SECTIONS
        : CATEGORIES.TASKS;

      if (category.title) {
        callback(category);
      }

      if (category[categorySectionKey]) {
        getTasks(
          category[categorySectionKey],
          callback,
        );
      }
    }
  });
};

const generateCategoryPath = (categoryReference) => {
  const lastIndexOfNumber = categoryReference.findLastIndex((reference) =>
    Number.isInteger(reference)
  );

  const categoryPathReference = categoryReference.slice(
    0,
    lastIndexOfNumber + 1
  );

  let categoryPath = "";
  let category = Categories

  for (let i = 0; i < categoryPathReference.length; i++) {
    const reference = categoryReference[i];

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

const getPathArrayFormat = (task) => {
  const pathStringFormat = task.getAttribute(DATA_CAT_REF);

  return pathStringFormat
    .split(",")
    .map((index) => (Number.isNaN(+index) ? index : +index));
};

export {
  CATEGORIES,
  CATEGORY,
  getTasks,
  Context,
  generateCategoryPath,
  getPathArrayFormat,
  Categories
};
