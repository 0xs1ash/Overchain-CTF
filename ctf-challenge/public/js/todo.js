

window.onload = function () {
    const csrf = document.getElementById('_csrf').value
    fetch('/getTodos', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'CSRF-TOKEN': csrf
        },
    })
    .then(res => {
        if (!res.ok) {
            window.location='/'
        } 
        return res.json();
    })
    .then(response => {
        const todos = response.todos;
        const todoListElement = document.getElementById('todoList');

        todos.forEach(todo => {
            const listItem = document.createElement('li');
            listItem.textContent = todo;
            todoListElement.appendChild(listItem);
        });
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
};



    function addTodo() {
        const csrf = document.getElementById('_csrf').value
        const todoText = document.getElementById('todoInput').value;
        const data = { 'todo': todoText }
        fetch('http://localhost:3000/addTodo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-TOKEN': csrf
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(response => {

                const list = document.createElement('li');
                const comment = document.createElement('p');
                comment.textContent = todoText;
                list.appendChild(comment);
                const currentList = document.getElementById('todoList');
                currentList.appendChild(list);

            }
            ).catch(err => {
                console.log(err);
            })
    }
    function clearTodoList() {
        const csrf = document.getElementById('_csrf').value
        const todoList = document.getElementById('todoList');
        fetch('http://localhost:3000/clearTodo', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'CSRF-TOKEN': csrf
            }
        })
            .then(res => {
                if(res.status===200){
                    todoList.innerHTML = '';
                }else {
                    window.location='/'
                }
            })
            .catch(err => {
                console.log(err)
            })
    }


document.getElementById('addTodoBtn').addEventListener('click', function() {
    addTodo();
});

document.getElementById('clearTodoBtn').addEventListener('click', function() {
    clearTodoList();
});
    