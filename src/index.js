import './style.css'
import EVENTS from "./EVENTS/EVENTS";
import { taskStore } from "./Todo-List/todo-list";
import homePage from './view/heroPage'
import PubSub from 'pubsub-js';

const components = [taskStore, homePage];

(function initComponent() {
  components.forEach((component) => component.init());
})();

PubSub.publish(EVENTS.PAGE.LOAD, document);

setTimeout(() => PubSub.publish(EVENTS.PAGE.REMOVE.HERO), 2000);

window.EVENTS = EVENTS;

// PubSub.publish(EVENTS.STORE.TASK_STORE.ADD, { description: "How to run away" });
