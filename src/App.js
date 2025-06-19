import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import "./App.css";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Post from "./Pages/Post";
import Profile from "./Pages/Profile";
import Edit from "./Pages/Edit";

function LayoutWrapper({children}){
  const location = useLocation();
  const noHeaderRoutes = ["/login", "/post", "/profile", "/register", "/edit-post"];

  const showHeader = !noHeaderRoutes.includes(location.pathname);

  return(
    <>
    {showHeader && <Header />} 
    {children}
    </>
  );
}

export default function App(){
  return(
    <BrowserRouter>
    <LayoutWrapper>
    <Routes>
      <Route path="/" exact={true} element={<Home />} />
      <Route path="/login" exact={true} element={<Login />} />
      <Route path="/post" exact={true} element={<Post />} />
      <Route path="/profile" exact={true} element={<Profile />} />
      <Route path="/register" exact={true} element={<Register />} />
      <Route path="/edit-post/:id" exact={true} element={<Edit />} />
    </Routes>
    </LayoutWrapper>
    </BrowserRouter>
  );    
}
