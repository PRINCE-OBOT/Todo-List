const storage = {
  get(key) {
    const todoListObj = localStorage.getItem(key);
    return JSON.parse(todoListObj);
  },

  set(key, todoListObj) {
    localStorage.setItem(key, JSON.stringify(todoListObj));
  }
};

export default storage