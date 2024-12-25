import React, { useEffect, useMemo, useState } from "react";
import { MRT_Table, useMaterialReactTable } from "material-react-table";
import axios from "axios";
import { Box, Button } from "@mui/material";
import WorkorderDialog from "./dialogWorkorder";

const DenseTable = () => {
  const [workorders, setWorkorders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWorkorder, setSelectedWorkorder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(response.data); // Log data to check for mwo_status
        setWorkorders(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (workorder) => {
    setSelectedWorkorder(workorder);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedWorkorder(null);
  };

  const columns = [
    {
      accessorKey: "workorder_number",
      header: "Workorder Number",
      Cell: ({ cell }) => (
        <Button
          variant="text"
          onClick={() => handleOpenDialog(cell.row.original)}
        >
          {cell.getValue()}
        </Button>
      ),
    },
    { accessorKey: "workorder_type", header: "Workorder Type" },
    { accessorKey: "mwo_status", header: "Workorder Status" },
    { accessorKey: "customer_id", header: "Customer ID" },
    { accessorKey: "gis_code", header: "GIS Code" },
    { accessorKey: "route_name", header: "Route Name" },
    { accessorKey: "homepass_count", header: "Homepass Count" },
    { accessorKey: "activity", header: "Activity" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "plan_received", header: "Plan Received" },
    { accessorKey: "survey_customer", header: "Survey Customer" },
    { accessorKey: "feasible", header: "Feasible" },
    {
      accessorKey: "informed_customer_email_date",
      header: "Informed Customer Email Date",
    },
    { accessorKey: "plan_received_date", header: "Plan Received Date" },
    { accessorKey: "date_of_surver", header: "Date of Survey" },
    { accessorKey: "reason_if_not_feasible", header: "Reason if Not Feasible" },
    { accessorKey: "remarks", header: "Remarks" },
    { accessorKey: "created_by", header: "Created By" },
    { accessorKey: "created_at", header: "Created At" },
  ];

  const table = useMaterialReactTable({
    columns: useMemo(() => columns, []),
    data: useMemo(() => workorders, [workorders]),
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    enableSorting: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.default,
    }),
    muiTableContainerProps: {
      sx: {
        maxHeight: 500,
        maxWidth: "100%",
        overflow: "auto",
        borderRadius: "8px",
      },
    },
    muiTableHeadProps: {
      sx: {
        backgroundColor: "rgba(0, 0, 0, 0.1)", // Different header color
      },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": {
          backgroundColor: (theme) => theme.palette.action.hover,
        },
        height: "10px", // Denser rows
      },
    },
    muiTableProps: {
      sx: {
        border: "1px solid rgba(81, 81, 81, .5)",
        "& .MuiTableCell-root": {
          padding: "1px", // Denser cells
        },
      },
    },
    muiTableHeadCellProps: {
      sx: {
        border: "1px solid rgba(81, 81, 81, .5)",
        fontStyle: "italic",
        fontWeight: "normal",
        padding: "1px", // Denser header cells
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid rgba(81, 81, 81, .5)",
        padding: "1px", // Denser body cells
      },
    },
  });

  return (
    <Box sx={{ overflow: "auto", maxWidth: "100%" }}>
      <MRT_Table table={table} />
      <WorkorderDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        workorder={selectedWorkorder}
      />
    </Box>
  );
};

export default DenseTable;
