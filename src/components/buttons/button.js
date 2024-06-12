import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
// import Stack from "@mui/material/Stack";
import { orange } from "@mui/material/colors";

const HeroBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(orange[500]),
  backgroundColor: orange[500],
  "&:hover": {
    backgroundColor: "black",
    color: "white",
  },
}));

const ButtonComponent = ({ variant, text, onClick }) => {
  return (
    <Button variant={variant} onClick={onClick}>
      {text}
    </Button>
  );
};

export default ButtonComponent;
