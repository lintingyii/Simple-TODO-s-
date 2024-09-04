import React from "react";
// import './Dropdown.css';

const Dropdown = ({ onChange, selected }) => {
  return (
    <div className="container">
      <h4 className="title">Theme</h4>
      <div className="dropdown">
        <select value={selected} onChange={onChange}>
          <option value="clementine">Clementine</option>
          <option value="summer">Summer Soda</option>
        </select>
      </div>
    </div>
  );
};

export default Dropdown;
