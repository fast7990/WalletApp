//database_name = "test.db",
//database_version = "1.0",
//database_displayname = "MySQLite",
//database_size = -1,

//db = null

//open(db)
//close(db)

//
const defaultState = {
  db: null,
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_SQLITE':
      return {
        ...state,
        db: action.payload.db,
      }
    case 'CLOSE_SQLITE':
      return {
        ...state,
        db: null,
      }
    default:
      return state
  }
}