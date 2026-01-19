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
import NavPage from "./nav";
import SubCategory from "./subCategory";

const navContentHolder = document.querySelector("[data-nav-content-holder]");
const navHolder = document.querySelector("[data-nav-holder]");

if (!storage.get(keys.todo_list))
  storage.set(keys.todo_list, new CategoryRoot());

function Nav() {
  const init = () => {
    PubSub.subscribe(EVENTS.NAV_RENDER_PREVIOUS, renderPrevious);
    PubSub.subscribe(EVENTS.NAV_RERENDER, rerender);
    PubSub.subscribe(EVENTS.NAV_RENDER, render);
  };

  const navHistory = [];

  function navigatePage(e) {
    const nav = e.target.dataset.nav;

    if (!nav) return;

    navContentHolder.innerHTML = "";

    const lastNav = navHistory[navHistory.length - 1];

    if (lastNav !== nav) navHistory.push(nav);

    PubSub.publish(EVENTS[nav]);
  }

  const renderPrevious = () => {
    navHistory.pop();
    rerender();
  };

  const rerender = () => {
    const currentPage = navHistory[navHistory.length - 1];
    navigatePage(new NavPage(currentPage));
  };

  const render = (_, page) => {
    navigatePage(new NavPage(page));
  };

  render("", "CATEGORY");

  navHolder.addEventListener("click", navigatePage);

  return { init };
}

const navComponent = [Today, TaskDialog, Search, Category, SubCategory, Nav];

navComponent.forEach((component) => {
  component(navContentHolder).init();
});

window.todoList = todoList;
