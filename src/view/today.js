import EVENTS from "../EVENTS/EVENTS";

function Today() {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.TODAY, renderToday);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.TODAY, removeToday);
  };

  const div = document.createElement("div");
  div.classList.add("today_page");

  div.innerHTML = `
  
  `;
  const renderToday = () => {
    document.body.append(div);
  };

  const removeToday = () => {
    div.remove();
  };

  return { init };
}
const Today = Today();

export default Today;
