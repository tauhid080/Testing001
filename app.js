// Simple Todo app using localStorage
const STORAGE_KEY = 'todo_app_v1'

// DOM
const form = document.getElementById('todo-form')
const input = document.getElementById('new-todo')
const list = document.getElementById('todo-list')
const countEl = document.getElementById('count')
const filters = document.querySelectorAll('.filter')
const clearCompletedBtn = document.getElementById('clear-completed')

let todos = []
let filter = 'all'

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    todos = raw ? JSON.parse(raw) : []
  }catch(e){
    console.error('Failed to parse todos from storage', e)
    todos = []
  }
}

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

function addTodo(text){
  if(!text || !text.trim()) return
  todos.unshift({id: uid(), text: text.trim(), completed: false})
  save()
  render()
}

function toggleTodo(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  t.completed = !t.completed
  save()
  render()
}

function removeTodo(id){
  todos = todos.filter(x => x.id !== id)
  save()
  render()
}

function editTodo(id, newText){
  const t = todos.find(x => x.id === id)
  if(!t) return
  t.text = newText.trim() || t.text
  save()
  render()
}

function clearCompleted(){
  todos = todos.filter(x => !x.completed)
  save()
  render()
}

function setFilter(f){
  filter = f
  filters.forEach(b => b.classList.toggle('active', b.dataset.filter === f))
  render()
}

function visibleTodos(){
  if(filter === 'active') return todos.filter(t => !t.completed)
  if(filter === 'completed') return todos.filter(t => t.completed)
  return todos
}

function render(){
  list.innerHTML = ''
  const visible = visibleTodos()

  visible.forEach(t => {
    const li = document.createElement('li')
    li.className = 'todo-item' + (t.completed ? ' completed' : '')

    // checkbox
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = t.completed
    cb.addEventListener('change', () => toggleTodo(t.id))

    // label
    const label = document.createElement('div')
    label.className = 'label'
    label.textContent = t.text

    // edit button
    const editBtn = document.createElement('button')
    editBtn.className = 'btn small'
    editBtn.textContent = 'Edit'
    editBtn.addEventListener('click', () => startEdit(li, t))

    // delete
    const delBtn = document.createElement('button')
    delBtn.className = 'btn small'
    delBtn.textContent = 'Delete'
    delBtn.addEventListener('click', () => removeTodo(t.id))

    li.appendChild(cb)
    li.appendChild(label)
    li.appendChild(editBtn)
    li.appendChild(delBtn)
    list.appendChild(li)
  })

  const remaining = todos.filter(t => !t.completed).length
  countEl.textContent = `${remaining} item${remaining === 1 ? '' : 's'} left`
}

function startEdit(li, todo){
  li.innerHTML = ''
  li.classList.remove('completed')

  const input = document.createElement('input')
  input.className = 'edit-input'
  input.value = todo.text

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      editTodo(todo.id, input.value)
    } else if(e.key === 'Escape'){
      render()
    }
  })

  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn small'
  saveBtn.textContent = 'Save'
  saveBtn.addEventListener('click', () => editTodo(todo.id, input.value))

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn small'
  cancelBtn.textContent = 'Cancel'
  cancelBtn.addEventListener('click', () => render())

  li.appendChild(input)
  li.appendChild(saveBtn)
  li.appendChild(cancelBtn)
  input.focus()
  input.select()
}

// Events
form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo(input.value)
  input.value = ''
  input.focus()
})

filters.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)))
clearCompletedBtn.addEventListener('click', clearCompleted)

// init
load()
render()

// Expose for console testing
window.__todo = {addTodo, toggleTodo, removeTodo, editTodo, clearCompleted, todos}
