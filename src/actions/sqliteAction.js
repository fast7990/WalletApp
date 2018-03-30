export function open(db) {
  return {
    type: "OPEN_SQLITE",
    payload: {
      db,
    }
  }
}

export function close() {
  return {
    type: "CLOSE_SQLITE",
    payload: {
    }
  }
}