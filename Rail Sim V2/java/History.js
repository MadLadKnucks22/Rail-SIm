class ActionLog {
    data = {};
    lastAction = null;

    constructor(){

    }

    log(action){
        this.data.push(action);
    }
}