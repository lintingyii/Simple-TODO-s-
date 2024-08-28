import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ onChange, checked }) => {
    return (
        <div className="switch">
            <input
                type="checkbox"
                id="toggleSwitch"
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor="toggleSwitch"></label>
        </div>
    );
};

export default ToggleSwitch;
