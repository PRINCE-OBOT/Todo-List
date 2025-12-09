# CONSOLE VERSION OF TODO-LIST

### Major Features

- Add Category (Top level path)
- Add Section (Second level path)
- Add task (task)
- Add subtask (subtask is under task)
- Sorting of the category base on priority when task is added
- Filtering of task that meet certain criteria

#### How to use Todo-list with console

- To add task (By default task are added in the inbox)

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.ADD, {
    title: "Go Jogging",
    description: "Go jogging the noon, and cut down 50% fat",
    status: false,
    priority: 1,
    label: "exercise"
  });
  ```

- To add task in any category - reference that category

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.REFERENCE, "Inbox>1");
  ```

  The category in index 1 of `inbox` is been reference here.

  _Note_: If a category is not reference correctly, task is stored directly in the `inbox`

- To add a section to inbox

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.INBOX.ADD_SECTION, {
    sectionTitle: "meditation"
  });
  ```

- To add a category to my_project

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_CATEGORY, {
    categoryTitle: "gym"
  });
  ```

- To add a section to my_project

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.MY_PROJECT.ADD_SECTION, {
    sectionTitle: "gym"
  });
  ```

- To display all category, include task

  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DISPLAY_ALL);
  ```

- To display only filtered task
  ```js
  PubSub.publish(EVENTS.TODO_LIST.CATEGORY.DISPLAY_FILTER, {
    filterKey: "title",
    filterValue: "Hockey"
  });
  ```

***Thank you***
