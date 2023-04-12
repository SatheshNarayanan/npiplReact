import React, { createContext } from "react";

export const ApplicationContext = createContext();

const ApplicaitonContextProvider = (props) => {
  let [state, setState] = React.useState({
    employeeInfo: "",
    token: "",
  });
  return (
    <ApplicationContext.Provider value={{ state, setState }}>
      {props.children}
    </ApplicationContext.Provider>
  );
};

export default ApplicaitonContextProvider;
