import EVENTS from "../EVENTS/EVENTS";
import PubSub from "pubsub-js";

const STORE_INIT = () => {
  PubSub.subscribe(EVENTS.STORE.CHANGE, updateStorage);
  PubSub.subscribe(EVENTS.STORE.ADD_TASK, addTask);
};

const STORE = [];

function addTask(msg, task) {
  STORE.push(task);
}

function updateStorage() {
  console.log(STORE);
}

export default STORE_INIT;
