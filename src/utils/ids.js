
const usedIds = new Set();

export const makeId = (prefix) => {
    let id;
    do{
        id = prefix +"-"+ Math.random().toString(36).slice(2, 8).padEnd(6, '0');
    }
    while (usedIds.has(id));
    
    usedIds.add(id);
    return id;
};