import "./style.css";
import PubSub from "pubsub-js";
import EVENTS from "./config/EVENTS";
import { category } from "./Todo-List/todo-list";
import homePage from "./view/heroPage";
import MainNavController from "./view/mainNavController";
import Today from "./view/today";
import Search from "./view/search";
import taskDialog from "./view/taskDialog";

const changeViewHolder = document.querySelector("[data-change-view-holder");
const mainNavigation = document.querySelector("[data-main-navigation]");

const mainNavController = MainNavController(mainNavigation, changeViewHolder);

const components = [category, homePage, mainNavController];

[Today, Search, taskDialog].forEach((component) => {
  components.push(component(changeViewHolder));
});

(function initComponent() {
  components.forEach((component) => component.init());
})();

// PubSub.publish(EVENTS.PAGE.LOAD.HERO);

// setTimeout(() => PubSub.publish(EVENTS.PAGE.REMOVE.HERO), 2000);

PubSub.publish(EVENTS.PAGE.LOAD.TODAY);
PubSub.publish(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER);

window.EVENTS = EVENTS;
