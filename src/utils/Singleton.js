let instance = null;

var db = '';

export default class Singleton {
  constructor() {
    if(!instance){
      instance = this;
    }
    return instance;
  }
  setDB(db){
    this.db=db;
  }
  getDB(db){
    return this.db;
  }
}