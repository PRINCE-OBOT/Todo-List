import PubSub from "pubsub-js";
import EVENTS from "./EVENTS/EVENTS";
import STORE_INIT from "./store/store";

const components = [STORE_INIT];

(function initComponent() {
  components.forEach((component) => component());
})()

PubSub.publish(EVENTS.STORE.ADD_TASK, { description: "How to run away" });
