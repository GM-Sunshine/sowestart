// Todo List Manager for Sowestart

const todoManager = {
    todos: [],

    init() {
        this.loadTodos();
        this.attachEventListeners();
        this.updateVisibility();
    },

    attachEventListeners() {
        const todoInput = document.getElementById('todo-input');
        const addButton = document.getElementById('add-todo-button');
        const toggleButton = document.getElementById('toggle-todo-widget');

        if (addButton) {
            addButton.addEventListener('click', () => {
                this.addTodo();
            });
        }

        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTodo();
                }
            });
        }

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }
    },

    loadTodos() {
        this.todos = storage.get('todos') || [];
        this.render();
    },

    saveTodos() {
        storage.set('todos', this.todos);
    },

    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();

        if (!text) return;

        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo); // Add to beginning
        this.saveTodos();
        this.render();
        input.value = '';
        input.focus();
    },

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    },

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    },

    toggleCollapse() {
        const container = document.getElementById('todo-list-container');
        const button = document.getElementById('toggle-todo-widget');
        const isCollapsed = container.classList.toggle('collapsed');

        // Rotate arrow
        if (isCollapsed) {
            button.style.transform = 'rotate(-90deg)';
            storage.set('todoWidgetCollapsed', true);
        } else {
            button.style.transform = 'rotate(0deg)';
            storage.set('todoWidgetCollapsed', false);
        }
    },

    updateVisibility() {
        const widget = document.getElementById('todo-widget');
        const enabled = storage.get('todoWidgetEnabled');

        if (enabled) {
            widget.classList.remove('hidden');
        } else {
            widget.classList.add('hidden');
        }

        // Check if collapsed
        const isCollapsed = storage.get('todoWidgetCollapsed');
        if (isCollapsed) {
            const container = document.getElementById('todo-list-container');
            const button = document.getElementById('toggle-todo-widget');
            container.classList.add('collapsed');
            button.style.transform = 'rotate(-90deg)';
        }
    },

    render() {
        const list = document.getElementById('todo-list');
        if (!list) return;

        if (this.todos.length === 0) {
            list.innerHTML = '<li class="todo-empty">No notes yet. Add one above!</li>';
            return;
        }

        list.innerHTML = this.todos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <label class="todo-checkbox">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}
                           onchange="todoManager.toggleTodo('${todo.id}')">
                    <span class="checkbox-custom"></span>
                </label>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="todo-delete" onclick="todoManager.deleteTodo('${todo.id}')" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </li>
        `).join('');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
