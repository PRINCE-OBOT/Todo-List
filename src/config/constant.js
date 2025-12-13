const CATEGORIES = {
  SUBTASKS: "subtasks",
  TASKS: "tasks",
  SECTIONS: "sections"
};

const Context = {
  NEW: "NEW",
  OLD: "OLD"
};

const CATEGORY_TITLE = "categoryTitle";
const SECTION_TITLE = "sectionTitle";

const getTasks = (categories, callback, context, categoryTitles) => {
  categories.forEach((category) => {
    if (Array.isArray(category)) {
      getTasks(category, callback, Context.NEW, categoryTitles);
    } else {
      const categorySectionKey = category.categoryTitle
        ? CATEGORIES.SECTIONS
        : category.sectionTitle
        ? CATEGORIES.TASKS
        : CATEGORIES.SUBTASKS;

      if (!category.title) {
        const categoryTitle = category.categoryTitle
          ? CATEGORY_TITLE
          : SECTION_TITLE;

        // If the iteration occur in the same array remove the last
        // `categoryTitle` before adding another `categoryTitle`
        // Else just add another `categoryTitle`
        // Changing context to OLD or NEW help to keep track
        // whether the iteration is occurring in the same array or not

        if (context === Context.OLD) {
          categoryTitles = categoryTitles.slice(
            0,
            categoryTitles.lastIndexOf("/")
          );
        }

        categoryTitles += ` / ${category[categoryTitle]}`;

        context = Context.OLD;
      } else {
        callback(category, categoryTitles);
      }

      if (category[categorySectionKey]) {
        getTasks(
          category[categorySectionKey],
          callback,
          Context.NEW,
          categoryTitles
        );
      }
    }
  });
};

export { CATEGORIES, getTasks, Context };
