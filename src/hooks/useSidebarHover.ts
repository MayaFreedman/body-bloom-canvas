import { useState, useEffect } from 'react';

export const useSidebarHover = () => {
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Check if mouse is over the sidebar area (right side controls)
      const rightColumn = document.getElementById('rightColumn');
      const controlButtons = document.querySelector('.control-buttons');
      
      let isOverSidebar = false;
      
      if (rightColumn) {
        const rect = rightColumn.getBoundingClientRect();
        isOverSidebar = event.clientX >= rect.left && 
                      event.clientX <= rect.right &&
                      event.clientY >= rect.top && 
                      event.clientY <= rect.bottom;
      }
      
      if (!isOverSidebar && controlButtons) {
        const rect = controlButtons.getBoundingClientRect();
        isOverSidebar = event.clientX >= rect.left && 
                      event.clientX <= rect.right &&
                      event.clientY >= rect.top && 
                      event.clientY <= rect.bottom;
      }
      
      setIsHoveringSidebar(isOverSidebar);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return isHoveringSidebar;
};