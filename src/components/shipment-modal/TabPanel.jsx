import React from 'react';

// Componente TabPanel para gestionar el contenido de cada pestaña
const TabPanel = ({ children, activeTab, tabId }) => {
    return activeTab === tabId ? children : null;
};

export default TabPanel;