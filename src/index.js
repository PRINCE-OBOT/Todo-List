import PubSub from "pubsub-js";
import EVENTS from "./EVENTS/EVENTS";
import { category } from "./Todo-List/todo-list";

const components = [category];

(function initComponent() {
  components.forEach((component) => component.init());
})();

window.EVENTS = EVENTS;

