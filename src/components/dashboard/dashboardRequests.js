import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { Box, lighten, Typography, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InventoryModal from "./inventoryModal";
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

const Example = ({ refreshKey }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => localStorage.getItem("username"), []);
  const [inventoryMaterial, setInventoryMaterial] = useState([]);
  const [allInventoryMaterial, setAllInventoryMaterial] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");
  const [inventoryStatusPass, setInventoryStatusPass] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  let inventoryStatus;

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setInventoryStatusPass(row ? row.inventory_inward_status : "");
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

  useEffect(() => {
    const fetchAllInventoryMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-all-inventory-materials`,
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
        setAllInventoryMaterial(inventoryMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllInventoryMaterial();
  }, []);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;

    const fetchInventoryData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending for receipt",
          "Pending for approval",
          "Approved",
          "Rejected by receiver",
          "Rejected by approver",
        ];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/inventory/get-inventory-receiver?user=${username}&inventorystatus=${status}`,
            {
              headers: { Authorization: `${localStorage.getItem("token")}` },
            }
          )
        );

        const responses = await Promise.all(promises);

        if (isMounted) {
          const combinedData = responses.flatMap((response) =>
            Array.isArray(response.data) ? response.data : []
          );

          setTableData(combinedData);
          setIsLoading(false);
          console.log(combinedData); // Log combined data for debugging
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load inventory");
          setIsLoading(false);
        }
        console.error("Error fetching inventory data:", err);
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

  const handleReject = async () => {
    console.log("Approved with comment:", comment);
    const actionedBy = localStorage.getItem("username") || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // AM/PM format
      timeZone: "IST", // Adjust to UTC
    });

    if (inventoryStatusPass === "Pending for receipt") {
      console.log("receipt");
      console.log(selectedRow);

      inventoryStatus = "Rejected by receiver";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateReceived`,
          {
            inventory_id: selectedRow.inventory_id, // Ensure this is passed to your modal
            inventory_inward_status: inventoryStatus,
            received_at: actionedAt,
            received_by: actionedBy,
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
    }
    if (inventoryStatusPass === "Pending for approval") {
      console.log(selectedRow);
      inventoryStatus = "Rejected by approver";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateApproved`,
          {
            inventory_id: selectedRow.inventory_id, // Ensure this is passed to your modal
            inventory_inward_status: inventoryStatus,
            approved_at: actionedAt,
            approved_by: actionedBy,
            approver_comments: comment,
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
    }
  };

  const handleApprove = async () => {
    console.log("Approved with comment:", comment);
    const actionedBy = localStorage.getItem("username") || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // AM/PM format
      timeZone: "IST", // Adjust to UTC
    });

    if (inventoryStatusPass === "Pending for receipt") {
      console.log("receipt");
      console.log(selectedRow);

      inventoryStatus = "Pending for approval";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateReceived`,
          {
            inventory_id: selectedRow.inventory_id, // Ensure this is passed to your modal
            inventory_inward_status: inventoryStatus,
            received_at: actionedAt,
            received_by: actionedBy,
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
    }
    if (inventoryStatusPass === "Pending for approval") {
      console.log(selectedRow);
      inventoryStatus = "Approved";
      console.log("Approved", 278);
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateApproved`,
          {
            inventory_id: selectedRow.inventory_id, // Ensure this is passed to your modal
            inventory_inward_status: inventoryStatus,
            approved_at: actionedAt,
            approved_by: actionedBy,
            approver_comments: comment,
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
    }
  };

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: "inventory_id",
      header: "MAT Inward Id",
      width: "20px",
      size: 50,
      filterFn: "contains",
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
      accessorKey: "warehouse_city",
      header: "Warehouse City",
      size: 200,
      filterFn: "contains",
    },

    {
      accessorKey: "inventory_inward_status",
      header: "Inward Status",
      size: 200,
      filterFn: "contains",
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      size: 150,
      filterFn: "contains",
    },

    // {
    //   accessorKey: "received_by",
    //   header: "Received By",
    //   size: 150,
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "approved_by",
    //   header: "Approved By",
    //   size: 150,
    //   filterFn: "contains",
    // },
    {
      accessorKey: "created_at",
      header: "Created Dt",
      size: 150,
      Cell: ({ cell }) => cell.getValue(), // Format date
      // filterFn: "contains",
    },
    // {
    //   accessorKey: "received_at",
    //   header: "Received Dt",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "approved_at",
    //   header: "Approved Dt",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "entry_date",
    //   header: "Entry Date",
    //   size: 150,
    //   Cell: ({ cell }) => cell.getValue(), // Format date
    //   filterFn: "contains",
    // },
    {
      accessorKey: "inventory_receiver_name",
      header: "Receiver Name",
      size: 200,
      // filterFn: "contains",
    },
    {
      accessorKey: "inventory_approver_name",
      header: "Approver Name",
      size: 200,
      // filterFn: "contains",
    },
    // {
    //   accessorKey: "customer_dc_number",
    //   header: "Customer DC Number",
    //   size: 200,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "dc_date",
    //   header: "DC Date",
    //   size: 150,
    //   Cell: ({ cell }) => cell.getValue(), // Format date
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "customer_id",
    //   header: "Customer ID",
    //   size: 150,
    //   filterFn: "contains",
    // },
    {
      accessorKey: "customer_name",
      header: "Customer Name",
      filterVariant: "multi-select",
      filterFn: "contains",
      size: 250,
    },
    // {
    //   accessorKey: "warehouse_id",
    //   header: "Warehouse ID",
    //   size: 150,
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "eway_bill_number",
    //   header: "Eway Bill Number",
    //   size: 200,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "mrs_number",
    //   header: "MRS Number",
    //   size: 150,
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "client_warehouse_id",
    //   header: "Cust. Warehouse ID",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "client_warehouse_city",
    //   header: "Cust. Warehouse City",
    //   size: 200,
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "created_by",
    //   header: "Created By",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "created_at",
    //   header: "Created Dt",
    //   size: 150,
    //   Cell: ({ cell }) => cell.getValue(), // Format date
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "received_by",
    //   header: "Received By",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "received_at",
    //   header: "Received Dt",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "approved_by",
    //   header: "Approved By",
    //   size: 150,
    //   filterFn: "contains",
    // },
    // {
    //   accessorKey: "approved_at",
    //   header: "Approved Dt",
    //   size: 150,
    //   filterFn: "contains",
    // },

    // {
    //   accessorKey: "material_id",
    //   header: "Material Id",
    //   size: 150,
    // },
    // {
    //   accessorKey: "material_desc",
    //   header: "Material Desc",
    //   size: 150,
    // },
    // {
    //   accessorKey: "material_uom",
    //   header: "Material UOM",
    //   size: 150,
    // },
    // {
    //   accessorKey: "material_wo_qty",
    //   header: "Material QTY",
    //   size: 150,
    // },
  ]);

  const handleExportRows = (rows) => {
    const flattened = [];
    console.log(rows);
    // Merge `tableData` with the material details
    rows.forEach((inventory) => {
      const materials = allInventoryMaterial.filter(
        (mat) => mat.inventory_id === inventory.inventory_id
      );
      if (materials.length > 0) {
        materials.forEach((mat) => {
          flattened.push({
            ...inventory,
            material_id: mat.material_id,
            material_desc: mat.material_desc,
            material_uom: mat.material_uom,
            material_inw_qty: mat.material_wo_qty,
          });
        });
      } else {
        // Push a row without material if no materials exist
        flattened.push({
          ...inventory,
          material_id: "",
          material_desc: "",
          material_wo_qty: "",
        });
      }
    });

    const csvConfig = mkConfig({
      filename: "inventory_with_materials",
      useKeysAsHeaders: true, // Automatically use keys as column headers
    });

    // Generate and download CSV
    const csv = generateCsv(csvConfig)(flattened);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: false,
    // getSubRows: (row) => row.materials,
    // enableExpanding: true,

    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowSelection: true,
    paginateExpandedRows: false,
    filterFns: {
      customFilterFn: (row, id, filterValue) => {
        return row.getValue(id) === filterValue;
      },
    },
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
      density: "compact",
      filterFn: "contains",
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
      {/* Main Button outside Table */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end", // Align button to the right
          marginBottom: "16px", // Add margin to separate from table
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() => {
            const filteredRows = table.getFilteredRowModel().rows; // Get filtered rows

            // Extract original data and remove 'materials' field
            const allOriginalData = filteredRows.map((row) => {
              const { materials, ...rest } = row.original; // Destructure and exclude 'materials'
              return rest; // Return the remaining data without 'materials'
            });

            console.log(allOriginalData); // Log the modified data without 'materials'

            handleExportRows(allOriginalData); // Export filtered rows without 'materials'
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          sx={{
            color: "black", // Text color
            backgroundColor: "#ec7c30", // Orange background
            height: "35px", // Ensure height is fixed
            padding: "10px 20px", // Add padding for better spacing
            borderRadius: "8px",
            marginTop: "-45px", // Optional: Round button edges
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black", // Keep the orange background on hover
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Material React Table with Toolbar */}
      <MaterialReactTable
        table={table}
        muiTableContainerProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid #ec7c30",
            width: "100%",
          },
        }}
        // renderRowSubComponent={({ row }) => (
        //   <Box sx={{ padding: 2 }}>
        //     <Typography variant="h6" sx={{ marginBottom: 1 }}>
        //       Materials Details
        //     </Typography>
        //     <MaterialReactTable
        //       columns={subRowColumns}
        //       data={row.materials} // Subrow data
        //       enableExpanding={false}
        //       enablePagination={false}
        //       enableSorting={false}
        //       muiTableProps={{
        //         sx: { backgroundColor: "#f9f9f9", border: "1px solid #ccc" },
        //       }}
        //     />
        //   </Box>
        // )}
        renderTopToolbar={({ table }) => (
          <Box
            sx={{
              backgroundColor: lighten("#f4f4f4", 0.05),
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 16px",
              width: "100%",
              boxSizing: "border-box",
              minHeight: "60px",
            }}
          >
            {/* Filters Section */}
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
            </Box>
          </Box>
        )}
      />

      {/* Inventory Modal */}
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
        inventoryStatus={inventoryStatusPass}
        handleReject={handleReject}
        username={username}
      />
    </Box>
  );
};

export default Example;
