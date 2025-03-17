import React from "react";
import NavBar from "./components/navbar";
import Search from "./components/search";
import { ABeeZee } from "next/font/google";

const abeezee = ABeeZee({ subsets: ["latin"], weight: "400" });

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className={`flex flex-row p-5 ${abeezee.className}`}>
      <NavBar />
      <div className="flex flex-1 justify-center">{children}</div> {/* Добавил flex-1 */}
      <Search />
    </div>
  );
};


export default Layout;
