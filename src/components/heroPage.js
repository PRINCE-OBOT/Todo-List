import EVENTS from "../events";

function HeroPage() {
  const init = () => {
    PubSub.subscribe(EVENTS.HERO_PAGE, render);
    PubSub.subscribe(EVENTS.REMOVE_HERO_PAGE, remove);
  };

  const div = document.createElement("div");
  div.classList.add("hero_page_text");
  div.textContent = "...✏️";

  const render = () => {
    document.body.append(div);
  };

  const remove = () => {
    div.remove();
  };

  return { init };
}

export default HeroPage;
