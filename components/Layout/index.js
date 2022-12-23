import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col items-center">
            <Header />
            {children}
        </div>
    );
};

export default Layout;