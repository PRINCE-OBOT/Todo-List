import "./style.css";
import PubSub from "pubsub-js";
import EVENTS from "./config/EVENTS";
import homePage from "./view/heroPage";
import MainNavController from "./view/mainNavController";
import Today from "./view/today";
import Search from "./view/search";
import taskDialog from "./view/taskDialog";
import CategoryPage from "./view/category";
import { categoryReference, taskAndCategoryHandler } from "./config/constant";
import CategorySubSection from "./view/categorySubsection";

const changeViewHolder = document.querySelector("[data-change-view-holder");
const mainNavigation = document.querySelector("[data-main-navigation]");

const mainNavController = MainNavController(mainNavigation, changeViewHolder);
const categoryPage = CategoryPage(mainNavigation, changeViewHolder);

const components = [categoryPage, homePage, mainNavController];

[Search, Today, taskDialog, CategorySubSection].forEach((component) => {
  components.push(component(changeViewHolder));
});

(function initComponent() {
  components.forEach((component) => component.init());
})();

PubSub.publish(EVENTS.PAGE.LOAD.MAIN_NAV_CONTROLLER);
PubSub.publish(EVENTS.PAGE.LOAD.CATEGORY, "CATEGORY");

taskAndCategoryHandler;

window.todo = { taskAndCategoryHandler, categoryReference };
