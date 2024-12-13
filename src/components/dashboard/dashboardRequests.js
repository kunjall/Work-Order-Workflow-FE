import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { Box, lighten, Typography } from "@mui/material";
import InventoryModal from "./inventoryModal";
const Example = () => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => localStorage.getItem("username"), []);
  const [inventoryMaterial, setInventoryMaterial] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [approver, setApprover] = useState("");
  const [comment, setComment] = useState("");
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setOpen(true); // Open the modal
  };

  useEffect(() => {
    // Reset the comment whenever a new request is selected
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false); // Close the modal
  };
  useEffect(() => {
    if (selectedRow != null) {
      console.log(selectedRow);
      const fetchInventoryMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/inventory/get-inventory-materials?inventory_id=${selectedRow.inventory_id}`,
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );

          const inventoryMaterialArray = response.data.map((material) => ({
            record_id: material.record_id,
            inventory_id: material.inventory_id,
            customer_dc_number: material.customer_dc_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_wo_qty: material.material_wo_qty,
          }));
          console.log(inventoryMaterialArray);
          setInventoryMaterial(inventoryMaterialArray);
        } catch (err) {
          console.error("Error fetching inventory materials:", err);
          setError("Failed to load inventory materials");
        }
      };

      fetchInventoryMaterial();
    }
  }, [selectedRow]);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;
    const fetchInventoryData = async () => {
      setIsLoading(true);
      try {
        // Fetching data for "Pending for Receipt"
        const response1 = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-inventory-receiver?user=${username}&inventorystatus=Pending for Reciept`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          }
        );

        // Fetching data for "Pending Approval"
        const response2 = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-inventory-receiver?user=${username}&inventorystatus=Pending Approval`,
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
          console.log(tableData);
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

  useEffect(() => {
    if (selectedRow != null && selectedRow.warehouse_city != null) {
      console.log(selectedRow);
      const fetchApprovers = async () => {
        try {
          console.log(selectedRow, "117");
          console.log(selectedRow.warehouse_city);
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=Inventory&city=${selectedRow.warehouse_city}`,
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );
          const approverArray = response.data.map((reviewer) => ({
            id: reviewer.record_id,
            type: reviewer.type,
            reviewer_email: reviewer.reviewer_email,
            approver_email: reviewer.approver_email,
            city: reviewer.city,
            reviewer_name: reviewer.reviewer_name,
            approver_name: reviewer.approver_name,
          }));
          console.log(approverArray, "138");
          setApprovers(approverArray);
        } catch (err) {
          console.error("Error fetching reviewer:", err);
          setError("Failed to load reviewer");
        }
      };

      fetchApprovers();
    }
  }, [selectedRow]);

  const handleApprove = async () => {
    console.log("Approved with comment:", comment);
    const receivedBy = localStorage.getItem("username") || "unknown";
    const receivedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // AM/PM format
      timeZone: "UTC", // Adjust to UTC
    });
    console.log(receivedAt, receivedBy);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/inventory/updateReceived`,
        {
          inventory_id: selectedRow.inventory_id, // Ensure this is passed to your modal
          inventory_inward_status: "Pending for approval",
          received_at: receivedAt,
          received_by: receivedBy,
          inventory_approver_email: selectedApproverEmail,
          inventory_approver_name: approverName,
          receiver_comments: comment,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error submitting materials:", error);
      setError("Failed to submit materials");
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "inventory_id",
        header: "Inventory Inward ID",
        size: 200,
        Cell: ({ row }) => (
          <span
            style={{
              color: "#007BFF",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => handleOpenModal(row.original)} // Pass the row's data
          >
            {row.original.inventory_id}
          </span>
        ),
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
        header: "Receiver Email",
        size: 250,
      },
      {
        accessorKey: "inventory_reviewer_name",
        header: "Receiver Name",
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
    enableRowSelection: false,
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
      <InventoryModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        inventoryMaterial={inventoryMaterial}
        setComment={setComment}
        comment={comment}
        handleApprove={handleApprove}
        approvers={approvers}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}

        // Pass the selected row data
      />
    </Box>
  );
};

export default Example;
