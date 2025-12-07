import PubSub from "pubsub-js";
import EVENTS from "./EVENTS/EVENTS";
import { taskStore } from "./Todo-List/todo-list";

const components = [taskStore];

(function initComponent() {
  components.forEach((component) => component.init());
})();

window.EVENTS = EVENTS;
window.taskStore

// PubSub.publish(EVENTS.STORE.TASK_STORE.ADD, { description: "How to run away" });
