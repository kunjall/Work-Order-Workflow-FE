import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import {
  Box,
  Button,
  lighten,
  MenuItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { AccountCircle, Send, WidthFull } from "@mui/icons-material";

const Example = () => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => localStorage.getItem("username"), []);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;
    const fetchInventoryData = async () => {
      setIsLoading(true);
      try {
        // Fetching data for "Pending for Receipt"
        const response1 = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-inventory-reciever?user=${username}&inventorystatus=Pending for Reciept`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          }
        );

        // Fetching data for "Pending Approval"
        const response2 = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-inventory-reciever?user=${username}&inventorystatus=Pending Approval`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          }
        );

        if (isMounted) {
          // Append the second set of data to the first one
          setTableData((prevData) => [
            ...prevData,
            ...response1.data,
            ...response2.data,
          ]);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load inventory");
          setIsLoading(false);
        }
      }
    };

    fetchInventoryData();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "inventory_id",
        header: "Inventory Inward ID",
        size: 200,
      },
      {
        accessorKey: "customer_dc_number",
        header: "Customer DC Number",
        size: 200,
      },
      {
        accessorKey: "inventory_inward_status",
        header: "Inward Status",
        size: 200,
      },
      {
        accessorKey: "customer_id",
        header: "Customer ID",
        size: 150,
      },
      {
        accessorKey: "customer_name",
        header: "Customer Name",
        size: 250,
      },
      {
        accessorKey: "warehouse_id",
        header: "Warehouse ID",
        size: 150,
      },
      {
        accessorKey: "warehouse_city",
        header: "Warehouse City",
        size: 200,
      },
      {
        accessorKey: "entry_date",
        header: "Entry Date",
        size: 150,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(), // Format date
      },
      {
        accessorKey: "dc_date",
        header: "DC Date",
        size: 150,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(), // Format date
      },
      {
        accessorKey: "eway_bill_number",
        header: "Eway Bill Number",
        size: 200,
      },
      {
        accessorKey: "mrs_number",
        header: "MRS Number",
        size: 150,
      },
      {
        accessorKey: "mrs_date",
        header: "MRS Date",
        size: 150,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(), // Format date
      },
      {
        accessorKey: "client_warehouse_id",
        header: "Cust. Warehouse ID",
        size: 150,
      },
      {
        accessorKey: "client_warehouse_city",
        header: "Cust. Warehouse City",
        size: 200,
      },
      {
        accessorKey: "inventory_reviewer_email",
        header: "Reciever Email",
        size: 250,
      },
      {
        accessorKey: "inventory_reviewer_name",
        header: "Reciever Name",
        size: 200,
      },
      {
        accessorKey: "inventory_approver_email",
        header: "Approver Email",
        size: 250,
      },
      {
        accessorKey: "inventory_approver_name",
        header: "Approver Name",
        size: 200,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        size: 150,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(), // Format date and time
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        size: 150,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowSelection: true,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      density: "compact",
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiTableContainerProps: {
      sx: {
        borderRadius: "16px", // Rounded edges
        border: "1px solid #ec7c30",
        width: "98%",
        margin: "0 auto",
      },
    },
    muiTableProps: {
      sx: {
        backgroundColor: "black",
        color: "#ec7c30",
        fontWeight: "bold",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: "white",
        color: "#ec7c30",
        fontWeight: "bold",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        color: "black",
      },
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
  });

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        width: "98%",
        margin: "0 auto",
        borderRadius: "16px", // Rounded edges
      }}
    >
      <MaterialReactTable
        table={table}
        muiTableContainerProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid #ec7c30",
            width: "100%",
          },
        }}
        renderTopToolbar={({ table }) => (
          <Box
            sx={(theme) => ({
              backgroundColor: lighten(theme.palette.background.default, 0.05),
              display: "flex",
              justifyContent: "space-between",
              p: "8px",
              width: "100%", // Adjusted to fit inside container
            })}
          >
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
            </Box>
          </Box>
        )}
      />
    </Box>
  );
};

export default Example;
