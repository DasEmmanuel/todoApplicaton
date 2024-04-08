const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server is running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const convertDbObjectToResponse = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//API 1

app.get('/todos/', async (request, response) => {
  let dataList = null

  let todoQuery = ''

  const {search_q = '', priority, status, category} = request.query

  switch (true) {
    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        todoQuery = `SELECT * FROM todo WHERE status = ${status};`
        dataList = await db.all(todoQuery)
        response.send(
          dataList.map(eachItem => convertDbObjectToResponse(eachItem)),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
  }
})

module.exports = app
