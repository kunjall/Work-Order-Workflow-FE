import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import WOW from "../../assets/images/wow.png";
import "../../assets/styles/navbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return user ? (
    <div className="header">
      <img src={WOW} alt="logo"></img>
      <nav>
        <ul>
          {user && user.role === "admin" && (
            <>
              <li style={{ fontSize: "15px" }}>
                <Link
                  to="/dashboard-admin"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <ReceiptLongIcon />
                  </span>
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li style={{ fontSize: "15px" }}>
                <Link
                  to="/enter"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <EngineeringIcon />
                  </span>
                  <span>W/O Details</span>
                </Link>
              </li>
              <li style={{ fontSize: "15px" }}>
                <Link
                  to="/bin"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <FolderOpenIcon />
                  </span>
                  <span>Bin</span>
                </Link>
              </li>
              {/* <li><Link to="/admin-settings">Admin Settings</Link></li> */}
            </>
          )}
          {user && user.role === "whinch" && (
            <>
              <li></li>
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
