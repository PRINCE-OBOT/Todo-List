import EVENTS from "../EVENTS/EVENTS";

function HeroPage() {
  const init = () => {
    PubSub.subscribe(EVENTS.PAGE.LOAD.HERO, renderHeroPage);
    PubSub.subscribe(EVENTS.PAGE.REMOVE.HERO, removeHeroPage);
  };

  const div = document.createElement("div");
  div.classList.add("hero_page_text");
  div.textContent = "...✏️";

  const renderHeroPage = () => {
    document.body.append(div);
  };

  const removeHeroPage = () => {
    div.remove();
  };

  return { init };
}
const heroPage = HeroPage();

export default heroPage;
