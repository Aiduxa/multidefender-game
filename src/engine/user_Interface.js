import React, { useState } from 'react';
import Render from './render';

const ToggleButton = ({ onClick, isActive }) => {
  const buttonClasses = `button ${isActive ? 'isActive' : ''}`;

  return (
    <div className={buttonClasses} onClick={onClick}>
      
    </div>
  );
};

  const UserInterface = () => {
    const [buildMode, setBuildMode] = useState(false);

    const toggleBuildMode = () => {
      setBuildMode(prevMode => !prevMode);
    };

  
    return (
      <div className="app-container">
        <div className="top-bar"></div>
        <div className="content">
        <LeftSidebar toggleBuildMode={toggleBuildMode} />  
        <Render buildMode={buildMode} />
          <RightSidebar />
        </div>
      </div>
    );
  };

const LeftSidebar = ({ toggleBuildMode}) => {
  const [buttonsState, setButtonsState] = useState([false, false]); // Assuming two buttons

  const handleButtonClick = (index) => {
    const newButtonsState = [...buttonsState];
    newButtonsState[index] = !newButtonsState[index];
    setButtonsState(newButtonsState);

    toggleBuildMode();
    
  };

  return (
    <div className="left-sidebar">
      <ToggleButton onClick={() => handleButtonClick(0)} isActive={buttonsState[0]} />
      <ToggleButton onClick={() => handleButtonClick(1)} isActive={buttonsState[1]} />
    </div>
  );
};


const RightSidebar = () => {

    return (
      <div className="right-sidebar">
        <button className='button'></button>
        <button className='button'></button>
      </div>
    );
  };



export default UserInterface;