import React, { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import "./style.css";

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [todos, setTodos] = useState(() => {
    const localValue = localStorage.getItem("ITEMS");
    if (localValue == null) return [];
    return JSON.parse(localValue);
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const localTheme = localStorage.getItem("DARK_MODE");
    return localTheme === "true";
  });

  useEffect(() => {
    localStorage.setItem("ITEMS", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("DARK_MODE", isDarkMode);
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  function handleSubmit(e) {
    e.preventDefault();
    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), title: newItem, completed: false },
    ]);
    setNewItem("");
  }

  function toggleTodo(id, completed) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <img className="pin" src="./pin.png" alt="pin" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "right",
          }}
        >
          <h1 style={{ whiteSpace: "nowrap", margin:'1rem 0rem' }}>
            Simple TODO
            <span style={{ fontFamily: "serif", fontStyle: "italic" }}>
              (s)
            </span>
          </h1>
        </div>
      </div>
      <ToggleSwitch
        checked={isDarkMode}
        onChange={() => setIsDarkMode((prev) => !prev)}
      />
      <div className="content">
        <form onSubmit={handleSubmit} className="new-item-form">
          <div className="form-row">
            <label htmlFor="item">New Item</label>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              type="text"
              id="item"
            />
          </div>
          <button className="btn">Add</button>
        </form>
        <form className="list-form">
          <h1 className="header">Todo List</h1>
          <ul className="list">
            {todos.length === 0 && "No Todos"}
            {todos.map((todo) => (
              <li key={todo.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                  />
                  <p style={{ margin: "4px" }}>{todo.title}</p>
                </label>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn btn-danger"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1rem"
                    height="1rem"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.5 6h5a2.5 2.5 0 0 0-5 0M10 6a4 4 0 0 1 8 0h6.25a.75.75 0 0 1 0 1.5h-1.31l-1.217 14.603A4.25 4.25 0 0 1 17.488 26h-6.976a4.25 4.25 0 0 1-4.235-3.897L5.06 7.5H3.75a.75.75 0 0 1 0-1.5zm2.5 5.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0zm3.75-.75a.75.75 0 0 0-.75.75v8.5a.75.75 0 0 0 1.5 0v-8.5a.75.75 0 0 0-.75-.75"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </form>
        <div className="footer">© Tingyi Lin | All rights reserved</div>
        {/* <ToggleSwitch
          checked={isDarkMode}
          onChange={() => setIsDarkMode((prev) => !prev)}
        /> */}
      </div>
    </>
  );
}
