export default class Modal {
  constructor(key, value, elem) {
    this.key = key;
    this.value = value;
    this.elem = elem;
  }

  static close(datasets, e) {
    datasets.forEach((obj) => {
      if (
        e.target.dataset[obj.key] !== obj.value &&
        !e.target.hasAttribute("data-remain")
      )
        obj.elem.classList.add("close");
    });
  }
}
