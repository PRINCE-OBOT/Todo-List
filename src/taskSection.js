class DOMSection {
  constructor() {
    this.history = [];
  }

  update(DOM) {
    this.history.push(DOM);
  }

  getLast() {
    return this.history[this.history.length - 1];
  }
}

const DOMsection = new DOMSection();

export default DOMsection;
