import React, { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import "./style.css";

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [newItemDate, setNewItemDate] = useState(""); // 新增日期状态
  const [todos, setTodos] = useState(() => {
    const localValue = localStorage.getItem("ITEMS");
    if (localValue == null) return [];
    return JSON.parse(localValue);
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const localTheme = localStorage.getItem("DARK_MODE");
    return localTheme === "true";
  });

  const [draggingIndex, setDraggingIndex] = useState(null);

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
          navigator.vibrate(100); // 震动100ms以提供反馈
        }
      }
    }, 100); // 你可以根据需要调整这个时间
  }

  function onTouchMove(e) {
    touchMoved = true; // 如果检测到移动，则取消长按操作
    e.preventDefault(); // 防止默认滚动行为
    if (draggingIndex === null) return; // 如果不在拖曳中，不处理移动事件

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
        navigator.vibrate(50); // 震动50ms以提供反馈
      }
    }
  }

  function onTouchEnd() {
    clearTimeout(pressTimer);
    if (draggingIndex !== null) {
      setDraggingIndex(null);
      if (navigator.vibrate) {
        navigator.vibrate(100); // 震动100ms以提供反馈
      }
    }
  }

  // 根据日期分组
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
      <ToggleSwitch
        checked={isDarkMode}
        onChange={() => setIsDarkMode((prev) => !prev)}
      />
      <div className="content">
        <form onSubmit={handleSubmit} className="new-item-form">
          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
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
              style={{fontWeight:'500', width:'100%'}}
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
                    key={todo.id} // 确保每个todo有唯一的key
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
                        draggingIndex === index
                          ? `2px solid ${isDarkMode ? "#E2DBD5" : "#000"}`
                          : undefined,
                      paddingLeft: "1rem",
                      cursor: "move",
                    }}
                    data-id={todo.id}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)} // 单独勾选当前的 todo
                      />
                      <p style={{ margin: "4px", display: "flex" }}>
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
        <div className="footer">© Tingyi Lin | All rights reserved</div>
      </div>
    </>
  );
}
