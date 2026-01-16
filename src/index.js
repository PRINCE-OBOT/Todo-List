import "./style.css";
import PubSub from "pubsub-js";
import EVENTS from "./events";
// import homePage from "./view/heroPage";
import Today from "./today";
import TaskDialog from "./components/taskDialog";
import storage from "./storage";
import keys from "./constant";
import { CategoryRoot } from "./category";
import todoList from "./todo_list";
import Search from "./components/search";
import Category from "./components/category";

const navContentHolder = document.querySelector("[data-nav-content-holder]");
const navHolder = document.querySelector("[data-nav-holder]");

if (!storage.get(keys.todo_list))
  storage.set(keys.todo_list, new CategoryRoot());

function Nav() {
  const init = () => {
    PubSub.subscribe(EVENTS.NAV_RERENDER, rerender);
  };

  const navHistory = [];

  const rerender = () => {
    const recentContent = navHistory[navHistory.length - 1];

    navContent({ target: { dataset: { nav: recentContent } } });
  };

  function navContent(e) {
    const nav = e.target.dataset.nav;

    if (!nav) return;

    navContentHolder.innerHTML = "";

    navHistory.push(nav);

    PubSub.publish(EVENTS[nav]);
  }

  navContent({ target: { dataset: { nav: "TODAY" } } });

  navHolder.addEventListener("click", navContent);

  return { init };
}

const navComponent = [Today, TaskDialog, Search, Category, Nav];

navComponent.forEach((component) => {
  component(navContentHolder).init();
});

window.todoList = todoList;
