import React from 'react';

import './index.scss';

const baseClass = 'after-dashboard';

const AfterDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <h4>You are viewing the plugin template.</h4>
      <p>
        Here is a custom component added from within the plugin.
        <br />
        You can find the code for this component in <code>src/components/afterDashboard</code>.
      </p>
    </div>
  );
};

export default AfterDashboard;
