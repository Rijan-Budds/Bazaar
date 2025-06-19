import Logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoIosAddCircle } from "react-icons/io";
import SearchBox from "./SearchBox";
import Button from "@mui/material/Button";
import Navigation from "./Navigation";
import Category from "./Category";
import AlertGif from "../../assets/alert.gif";

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleChats = () => {
    navigate("/chats");
  };

  const handlePost = () => {
    navigate("/post");
  };

  return (
    <>
      <div className="headerWrapper">
        <div className="top-strip bg-purple">
          <div className="container">
            <p className="mb-0 mt-0 text-center">
              Please be aware of <b>scams.</b>
            </p>
          </div>
        </div>

        <header className="header">
          <div className="container">
            <div className="row align-items-center">
              <div className="logoWrapper col-sm-2">
                <Button>
                  <Link to="/">
                    <img src={Logo} alt="Logo" />
                  </Link>
                </Button>
              </div>
              <div className="col-sm-10">
                <div className="d-flex align-items-center">
                  <SearchBox />

                  <div className="part-3 headerNotify ml-2">
                    <Button className="message" onClick={handleChats}>
                      <FaMessage />
                    </Button>
                  </div>
                  <div className="part-3 headerPost ml-4">
                    <Button className="post" onClick={handlePost}>
                      <IoIosAddCircle />
                    </Button>
                  </div>
                  <div className="part-3 d-flex align-items-center ml-4">
                    <Button className="circle" onClick={handleLoginClick}>
                      <FaUser />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="gif-wrapper text-center">
          <img
            src={AlertGif}
            alt="Alert GIF"
            className="w-full max-w-xs mx-auto"
          />
        </div>

        <Navigation />
      </div>
    </>
  );
};

export default Header;
