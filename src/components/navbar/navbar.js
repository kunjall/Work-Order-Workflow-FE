import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import WOW from "../../assets/images/wow.png";
import "../../assets/styles/navbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return user ? (
    <div className="header">
      <img src={WOW}></img>
      <nav>
        <ul>
          {user && user.role === "admin" && (
            <>
              <li>
                <Link to="/dashboard-admin">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/test">Test</Link>
              </li>
              {/* <li><Link to="/admin-settings">Admin Settings</Link></li> */}
            </>
          )}
          {user && user.role === "whinch" && (
            <>
              <li>
                <Link to="/dashboard-whinch">
                  <InventoryIcon
                    sx={{
                      color: "white",
                      fontSize: "19px",
                      paddingRight: "10px",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />
                  Inventory Inward
                </Link>
              </li>
              <li>
                <Link to="/test2">Test</Link>
              </li>
              <li>
                <Link to="/test2">Test</Link>
              </li>
              <li>
                <Link to="/test2">Test</Link>
              </li>
            </>
          )}
          {/* {user && user.role === "guest" && (
          <>
            <li>
              <Link to="/guest-dashboard">Guest Dashboard</Link>
            </li>
          </>
        )}
        {!user && (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )} */}
          {/* {user && (
          <li><button onClick={() => { }}>Logout</button></li>
        )} */}
        </ul>
      </nav>
      <div className="nav-end">
        <span className="nav-item">
          <Link to="/test2">
            <AccountCircleIcon
              sx={{ color: "white", marginRight: "10px", fontSize: "35px" }}
            />
          </Link>
        </span>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Navbar;
