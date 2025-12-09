import "./style.css";
import PubSub from "pubsub-js";
import EVENTS from "./EVENTS/EVENTS";
import { category } from "./Todo-List/todo-list";
import homePage from "./view/heroPage";
import mainNavController from "./view/mainNavController";

const components = [category, homePage, mainNavController];

(function initComponent() {
  components.forEach((component) => component.init());
})();

// PubSub.publish(EVENTS.PAGE.LOAD.HERO);

// setTimeout(() => PubSub.publish(EVENTS.PAGE.REMOVE.HERO), 2000);

PubSub.publish(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER);

window.EVENTS = EVENTS;
