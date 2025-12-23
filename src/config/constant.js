const CATEGORIES = {
  TASKS: "tasks",
  SUBTASKS: "subtasks",
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
        : CATEGORIES.TASKS;

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

const CreateTaskTemplate = () => {
  const task = document.createElement("div");
  task.classList.add("task");

  task.innerHTML = `
      <input class="mark-status" data-task-action="mark" type="checkbox" data-priority />
      
      <div class="title-and-date-section">
        <div class="title"></div>
        <p class="description"></p>
      </div>
      
      <div class="task-right-side">
        <div class="more_options_section">
          
          <div class="more_options_action hide">
            <span class="delete_task" data-task-action="delete">Delete</span>
            <span class="view_task" data-task-action="view">View</span>
          </div>
          
          <div class="show_more_options" data-more-option="toggle">
            &vellip;
          </div>
        </div>

        <p class="categoryTitle"></p>
      </div>
    `;

  const getTaskTemplate = () => task.cloneNode(true);

  return { getTaskTemplate };
};

const taskTemplate = CreateTaskTemplate();

export { CATEGORIES, getTasks, Context, taskTemplate };
