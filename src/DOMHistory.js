class DOMHis {
  constructor() {
    this.history = [];
  }

  add(DOM) {
    this.history.push(DOM);
  }

  removeLast() {
    this.history[this.history.length - 1].remove();
  }

  getLast() {
    return this.history, this.history[this.history.length - 1];
  }

  clear() {
    this.history = [];
  }
}

const DOMHistory = new DOMHis();

export default DOMHistory;
