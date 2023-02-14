import "./index.scss";

const isLocalhost = Boolean(
	window.location.hostname === "localhost" ||
		window.location.hostname === "[::1]" ||
		window.location.hostname.match(
			/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
		)
);
const api = isLocalhost
	? "http://localhost"
	: "http://saakd.nighthawkcodingsociety.com";

const form = document.getElementById("addTodo")!;
const todos = document.getElementById("todos")!;
const clear = document.getElementById("clear")!;
const todoInput = document.getElementById("todo")! as HTMLInputElement;
let justToggled = false;
let todosLocal = [] as Todo[];

type Todo = {
	text: string;
	complete: boolean;
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

		todoDiv.classList.add("todoDiv");
		todoText.innerHTML = todo.text;
		todoText.style.textDecoration = todo.complete ? "line-through" : "none";
		todoText.style.cursor = "pointer";
		todoRemove.innerHTML = "x";

		todoRemove.addEventListener("click", () => {
			removeTodo(todo.id);
		});
		todoText.addEventListener("click", () => toggleTodo(todo.id));
		todoText.addEventListener("mouseover", () => {
			if (justToggled) return;
			todoText.style.textDecoration = !todo.complete ? "line-through" : "none";
		});
		todoText.addEventListener("mouseleave", () => {
			justToggled = false;
			todoText.style.textDecoration = todo.complete ? "line-through" : "none";
		});

		todos.appendChild(todoDiv);
		todoDiv.appendChild(todoRemove);
		todoDiv.appendChild(todoText);
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
	todosLocal[idx].complete = todo.complete;

	justToggled = true;
	rerender();
};

const clearTodos = async () => {
	const list = await fetch(api + "/todoList", { method: "DELETE" }).then((r) =>
		r.json()
	);
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
