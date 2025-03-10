import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [Sale, setSale] = useState(false);


  useEffect(() => {
    async function loadData() {
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
      };
      if (localStorage.getItem("Sale")) {
        setSale(localStorage.getItem("Sale"));
      };
    };
    loadData();
  }, []);

  const contextValue = {
    token,
    setToken,
    Sale,
    setSale,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;