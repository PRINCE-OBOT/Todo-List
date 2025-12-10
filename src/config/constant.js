const CATEGORIES = {
  SUBTASKS: "subtasks",
  TASKS: "tasks",
  SECTIONS: "sections"
};

const filterTaskBy = (categories, callback) => {
  categories.forEach((category) => {
    if (Array.isArray(category)) {
      filterTaskBy(category, callback);
    } else {
      const categorySectionKey = category.categoryTitle
        ? CATEGORIES.SECTIONS
        : category.sectionTitle
        ? CATEGORIES.TASKS
        : CATEGORIES.SUBTASKS;

      if (category.title) {
        callback(category);
      }

      if (category[categorySectionKey]) {
        filterTaskBy(category[categorySectionKey], filterKey, filterValue);
      }
    }
  });
};

export { CATEGORIES, filterTaskBy };
