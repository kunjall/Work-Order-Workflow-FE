import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { orange } from "@mui/material/colors";

const HeroBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(orange[500]),
  backgroundColor: orange[500],
  "&:hover": {
    backgroundColor: "black",
    color: "white",
  },
}));

const ButtonComponent = ({ text }) => {
  return (
    <Stack spacing={2} direction="row">
      <HeroBtn variant="contained">{text}</HeroBtn>
    </Stack>
  );
};

export default ButtonComponent;
