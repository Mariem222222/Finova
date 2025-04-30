import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export function NavbarAuth({ brandName, userRole, onSignOut }) {
  const [openNav, setOpenNav] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Define routes for authenticated users and admins
  const authenticatedRoutes = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/transactions" },
  ];

  const adminRoutes = [
    { name: "Admin Panel", path: "/admin" },
    { name: "Manage Users", path: "/manage-users" },
  ];

  // Determine which routes to display
  const filteredRoutes = userRole === "admin" ? adminRoutes : authenticatedRoutes;

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {filteredRoutes.map(({ name, path }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          <Link
            to={path}
            className="flex items-center gap-1 p-1 font-bold"
          >
            {name}
          </Link>
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar color="transparent" className="p-3">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link to="/">
          <Typography className="mr-4 ml-2 cursor-pointer py-1.5 font-bold">
            {brandName}
          </Typography>
        </Link>
        <div className="hidden lg:block">{navList}</div>
        <div className="flex items-center gap-4">
          {/* Profile Icon */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSignOut();
                    navigate("/sign-in");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <IconButton
            variant="text"
            size="sm"
            color="white"
            className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon strokeWidth={2} className="h-6 w-6" />
            ) : (
              <Bars3Icon strokeWidth={2} className="h-6 w-6" />
            )}
          </IconButton>
        </div>
      </div>
      <MobileNav
        className="rounded-xl bg-white px-4 pt-2 pb-4 text-blue-gray-900"
        open={openNav}
      >
        <div className="container mx-auto">
          {navList}
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

NavbarAuth.defaultProps = {
  brandName: "Finova",
  userRole: "user",
};

NavbarAuth.propTypes = {
  brandName: PropTypes.string,
  userRole: PropTypes.string,
  onSignOut: PropTypes.func.isRequired,
};

export default NavbarAuth;