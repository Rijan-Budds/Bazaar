import Button from "@mui/material/Button";
import { FaAngleDown } from "react-icons/fa6";
import { IoMenuSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav>
      <div className="container">
        <div className="row">
          <div className="col-sm-3 navPart1">
            <Button className="allCatTab align-items-center">
              <span className="icon1 mr-2">
                <IoMenuSharp />
              </span>

              <span className="text">Categories</span>
              <span className="icon2 ml-2">
                <FaAngleDown />
              </span>
            </Button>
          </div>
          <div className="col-sm-9 navPart2">
            <ul className="list list-inline">
                <li className="list-inline-item mr-4">
                  <p>Top Categories</p>
                  </li>
              <li className="list-inline-item">
                <Link to="/">Mobile Phones </Link>
              </li>
              <li className="list-inline-item">
                <Link to="/">Want To Buy(Buyer's list)</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/">Real Estate</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/">Business & Industrial</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
