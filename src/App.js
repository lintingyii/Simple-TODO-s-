import React, { useEffect, useState } from "react";
import Dropdown from "./Dropdown";
import "./style.css";
import "./Dropdown.css";
import Marquee from "react-fast-marquee";

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [todos, setTodos] = useState(() => {
    const localValue = localStorage.getItem("ITEMS");
    if (localValue == null) return [];
    return JSON.parse(localValue);
  });
  const [theme, setTheme] = useState(() => {
    const localTheme = localStorage.getItem("THEME") || "clementine";
    return localTheme;
  });

  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("ITEMS", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("THEME", theme);
    document.body.classList.toggle("summer-mode", theme === "summer");
    document.body.classList.toggle("clementine-mode", theme === "clementine");
    document.body.classList.toggle("branch-mode", theme === "branch");
  }, [theme]);

  function handleSubmit(e) {
    e.preventDefault();
    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: crypto.randomUUID(),
        title: newItem,
        completed: false,
        date: newItemDate, // 添加日期
      },
    ]);
    setNewItem("");
    setNewItemDate(""); // 重置日期输入框
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function clearTodos() {
    setTodos([]); // 清空 todos 列表
  }

  function onDragStart(index) {
    setDraggingIndex(index);
  }

  function onDragOver(index) {
    if (draggingIndex === index) return;

    const newTodos = [...todos];
    const draggedItem = newTodos[draggingIndex];
    newTodos.splice(draggingIndex, 1);
    newTodos.splice(index, 0, draggedItem);

    setDraggingIndex(index);
    setTodos(newTodos);
  }

  function onDragEnd() {
    setDraggingIndex(null);
  }

  let pressTimer = null;
  let touchMoved = false;

  function onTouchStart(index) {
    touchMoved = false;
    pressTimer = setTimeout(() => {
      if (!touchMoved) {
        setDraggingIndex(index);
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }, 100); // 控制長按反饋時間
  }

  function onTouchMove(e) {
    touchMoved = true;
    e.preventDefault();
    if (draggingIndex === null) return;

    const touchLocation = e.targetTouches[0];
    const targetElement = document.elementFromPoint(
      touchLocation.clientX,
      touchLocation.clientY
    );

    const targetIndex = todos.findIndex(
      (todo) => todo.id === targetElement?.dataset?.id
    );

    if (targetIndex >= 0 && draggingIndex !== targetIndex) {
      onDragOver(targetIndex);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }

  function onTouchEnd() {
    clearTimeout(pressTimer);
    if (draggingIndex !== null) {
      setDraggingIndex(null);
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  }

  // 清單根據日期分组
  const groupedTodos = todos.reduce((groups, todo) => {
    const date = todo.date || "No Date";
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(todo);
    return groups;
  }, {});

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
          <h1 style={{ whiteSpace: "nowrap", margin: "1rem 0rem" }}>
            Simple TODO
            <span style={{ fontFamily: "serif", fontStyle: "italic" }}>
              (s)
            </span>
          </h1>
        </div>
      </div>
      <Dropdown selected={theme} onChange={(e) => setTheme(e.target.value)} />
      <div className="content">
        <form onSubmit={handleSubmit} className="new-item-form">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.8rem",
              boxSizing: "border-box",
            }}
          >
            <div className="form-row">
              <label htmlFor="item">New Item</label>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                type="text"
                id="item"
              />
            </div>
            <div className="form-row">
              <label htmlFor="date">Due Date</label>
              <input
                value={newItemDate}
                onChange={(e) => setNewItemDate(e.target.value)}
                type="date"
                id="date"
                // style={{fontWeight:'500', width:'100%', height:'100%'}}
              />
            </div>
          </div>
          <button className="btn">Add</button>
        </form>
        <form className="list-form">
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: ".5rem",
            }}
          >
            <h1 className="header">Todo List</h1>
            <button className="btn btn-clearall" onClick={clearTodos}>
              Clear All
            </button>
          </div>
          <ul className="list">
            {todos.length === 0 && "No Todos"}
            {Object.keys(groupedTodos).map((date) => (
              <div key={date} className="date-group">
                <p className="date">{date}</p>
                {groupedTodos[date].map((todo, index) => (
                  <li
                    key={todo.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={() => onDragOver(index)}
                    onDragEnd={onDragEnd}
                    onTouchStart={() => onTouchStart(index)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                      opacity: draggingIndex === index ? 0.5 : 1,
                      borderLeft:
                        draggingIndex === index ? `2px solid` : undefined,
                      paddingLeft: "1rem",
                      cursor: "move",
                    }}
                    data-id={todo.id}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <p
                        style={{
                          margin: "4px",
                          display: "flex",
                          lineHeight: "1.5",
                        }}
                      >
                        {todo.title}
                      </p>
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
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <path
                          fill="currentColor"
                          d="M11.5 6h5a2.5 2.5 0 0 0-5 0M10 6a4 4 0 0 1 8 0h6.25a.75.75 0 0 1 0 1.5h-1.31l-1.217 14.603A4.25 4.25 0 0 1 17.488 26h-6.976a4.25 4.25 0 0 1-4.235-3.897L5.06 7.5H3.75a.75.75 0 0 1 0-1.5zm2.5 5.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0zm5.5 0a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0z"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </div>
            ))}
          </ul>
        </form>
        <Marquee speed={60}>
          <div className="marquee">
            <div>More to come 👀</div> <div>More to come 👀</div>{" "}
            <div>More to come 👀</div> <div>More to come 👀</div>
          </div>
        </Marquee>
        <div className="footer">© Tingyi Lin | All rights reserved</div>
      </div>
    </>
  );
}
