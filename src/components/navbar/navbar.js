import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import WOW from "../../assets/images/wow.png";
import "../../assets/styles/navbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation(); // Get the current route

  const getActiveStyle = (path) => ({
    color: location.pathname === path ? "#40E0D0" : "white", // Highlight active link
    textDecoration: location.pathname === path ? "underline" : "none", // Underline for active link
  });

  return user ? (
    <div className="header">
      <img src={WOW} alt="logo"></img>
      <nav>
        <ul>
          {user && user.role === "admin" && (
            <>
              <li style={{ fontSize: "16px" }}>
                <Link
                  to="/dashboard-admin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/dashboard-admin"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <ReceiptLongIcon />
                  </span>
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li style={{ fontSize: "16px" }}>
                <Link
                  to="/inventory-inward"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/inventory-inward"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <ReceiptLongIcon />
                  </span>
                  <span>Inventory Inward</span>
                </Link>
              </li>
              <li style={{ fontSize: "16px" }}>
                <Link
                  to="/create"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/create"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <EngineeringIcon />
                  </span>
                  <span>Mother W/O</span>
                </Link>
              </li>
              <li style={{ fontSize: "16px" }}>
                <Link
                  to="/find"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/find"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <FolderOpenIcon />
                  </span>
                  <span>Child W/O</span>
                </Link>
              </li>
              <li style={{ fontSize: "16x" }}>
                <Link
                  to="/bin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/bin"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <FolderOpenIcon />
                  </span>
                  <span>Locator</span>
                </Link>
              </li>
              <li style={{ fontSize: "16px" }}>
                <Link
                  to="/repository"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    ...getActiveStyle("/repository"),
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    <MenuBookIcon />
                  </span>
                  <span>Repository</span>
                </Link>
              </li>
            </>
          )}
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
