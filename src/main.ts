import "./index.scss";

const isLocalhost = Boolean(
	window.location.hostname === "localhost" ||
		window.location.hostname === "[::1]" ||
		window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);
const api = isLocalhost ? "http://localhost:8199" : "https://saakd.nighthawkcodingsociety.com";

const form = document.getElementById("addTodo")!;
const todos = document.getElementById("todos")!;
const clear = document.getElementById("clear")!;
const todoInput = document.getElementById("todo")! as HTMLInputElement;
let todosLocal = [] as Todo[];

type Todo = {
	text: string;
	completed: boolean;
	id: string;
};

const getList = async () => {
	const list = await fetch(api + "/todoList").then((r) => r.json());
	todosLocal = list;
};

const rerender = () => {
	todos.innerHTML = "";
	todosLocal.forEach((todo) => {
		const todoDiv = document.createElement("div");
		const todoText = document.createElement("p");
		const todoRemove = document.createElement("button");
		const todoCheckbox = document.createElement("div");

		todoCheckbox.classList.add("todoCheckbox");
		todoDiv.classList.add("todoDiv");
		todoText.innerHTML = todo.text;
		if (todo.completed) todoDiv.classList.add("todoComplete");

		todoText.style.cursor = "pointer";
		todoRemove.innerHTML = "&#10005;";

		todoRemove.addEventListener("click", () => {
			if (!(prompt("Are you sure you would like to remove this todo? [y/N]") === "y")) return;
			removeTodo(todo.id);
		});
		todoCheckbox.addEventListener("click", () => toggleTodo(todo.id));

		todos.appendChild(todoDiv);
		todoDiv.appendChild(todoCheckbox);
		todoDiv.appendChild(todoText);
		todoDiv.appendChild(todoRemove);
	});
};

// handlers
// todo: optimize rendering (diff algo)

const addTodo = async (text: string) => {
	const todo = await fetch(api + "/todo", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text }),
	}).then((r) => r.json());

	todosLocal.push(todo);
	rerender();
};

const removeTodo = async (id: string) => {
	const todo = await fetch(api + "/todo", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id }),
	}).then((r) => r.json());

	todosLocal = todosLocal.filter((t) => t.id !== todo.id);
	rerender();
};

const toggleTodo = async (id: string) => {
	const todo = await fetch(api + "/todo", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id }),
	}).then((r) => r.json());

	const idx = todosLocal.findIndex((t) => t.id === todo.id);
	todosLocal[idx].completed = todo.completed;
	rerender();
};

const clearTodos = async () => {
	const list = await fetch(api + "/todoList", {
		method: "DELETE",
	}).then((r) => r.json());
	todosLocal = list;
	rerender();
};

// onloads

const main = async () => {
	await getList();
	rerender();
};

form.addEventListener("submit", (e) => {
	e.preventDefault();
	e.stopImmediatePropagation();

	const data = new FormData(e.target! as HTMLFormElement);
	const todo = data.get("todo");
	if (!todo) return;

	addTodo(todo.toString());
	todoInput.value = "";
});

clear.addEventListener("click", clearTodos);

main();

export {};
