import "./index.scss";
import { v4 as uuidv4 } from "uuid";

const LS_KEY = "TODO_LIST";
const form = document.getElementById("addTodo")!;
const todos = document.getElementById("todos")!;
const clear = document.getElementById("clear")!;
const todoInput = document.getElementById("todo")! as HTMLInputElement;

type Todo = {
	text: string;
	complete: boolean;
	id: string;
};

const getList = () => {
	const rawList = localStorage.getItem(LS_KEY);
	return JSON.parse(rawList ?? "[]") as Todo[];
};

const setList = (newList: Todo[]) => {
	localStorage.setItem(LS_KEY, JSON.stringify(newList));
	return newList;
};

const rerender = (todoList: Todo[]) => {
	todos.innerHTML = "";
	todoList.forEach((todo) => {
		const todoDiv = document.createElement("div");
		const todoText = document.createElement("p");
		const todoRemove = document.createElement("button");
		const todoCheckbox = document.createElement("div");

		todoCheckbox.classList.add("todoCheckbox");
		todoDiv.classList.add("todoDiv");
		todoText.innerHTML = todo.text;
		if (todo.complete) todoDiv.classList.add("todoComplete");

		todoText.style.cursor = "pointer";
		todoRemove.innerHTML = "&#10005;";

		todoRemove.addEventListener("click", () => {
			if (!(prompt("Are you sure you would like to remove this todo? [y/N]") === "y")) return;
			rerender(removeTodo(todo.id));
		});
		todoCheckbox.addEventListener("click", () => rerender(toggleTodo(todo.id)));

		todos.appendChild(todoDiv);
		todoDiv.appendChild(todoCheckbox);
		todoDiv.appendChild(todoText);
		todoDiv.appendChild(todoRemove);
	});
};

// handlers
// todo: optimize rendering (diff algo)

const addTodo = (todo: string) => {
	return setList([...getList(), { text: todo, complete: false, id: uuidv4() }]);
};

const removeTodo = (id: string) => {
	return setList(getList().filter((todo) => todo.id !== id));
};

const toggleTodo = (id: string) => {
	const prevList = getList();
	const todoId = prevList.findIndex((todo) => todo.id === id);
	prevList[todoId]["complete"] = !prevList[todoId]["complete"];

	return setList(prevList);
};

// onloads

rerender(getList());

form.addEventListener("submit", (e) => {
	e.preventDefault();
	e.stopImmediatePropagation();

	const data = new FormData(e.target! as HTMLFormElement);
	const todo = data.get("todo");
	if (!todo) return;

	const newTodos = addTodo(todo.toString());
	todoInput.value = "";
	rerender(newTodos);
});

clear.addEventListener("click", () => {
	rerender(setList([]));
});

export {};
