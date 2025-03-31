import { useMemo, useState, useEffect, useContext } from "react";
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
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const { user } = useContext(AuthContext);

  const username = useMemo(() => user.username, [user]);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setInventoryStatusPass(row ? row.inventory_inward_status : "");
    setOpen(true);
  };

  useEffect(() => {
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (selectedRow != null) {
      const fetchInventoryMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/inventory/get-inventory-materials?inventory_id=${selectedRow.inventory_id}`,
            {
              headers: {
                Authorization: user.authToken,
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
              Authorization: user.authToken,
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
        setAllInventoryMaterial(inventoryMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setAllInventoryMaterial([]);
      }
    };
    fetchAllInventoryMaterial();
  }, []);

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
              headers: { Authorization: user.authToken },
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
      const fetchApprovers = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=Inventory&city=${selectedRow.warehouse_city}`,
            {
              headers: {
                Authorization: user.authToken,
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
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
    const actionedBy = user.name || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });

    if (inventoryStatusPass.toLowerCase() === "pending for receipt") {
      inventoryStatus = "Rejected by receiver";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateReceived`,
          {
            inventory_id: selectedRow.inventory_id,
            inventory_inward_status: inventoryStatus,
            received_at: actionedAt,
            received_by: actionedBy,
            inventory_approver_email: selectedApproverEmail,
            inventory_approver_name: approverName,
            receiver_comments: comment,
          },
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
      } catch (error) {
        console.error("Error submitting materials:", error);
        setError("Failed to submit materials");
      }
    }
    if (inventoryStatusPass.toLowerCase() === "pending for approval") {
      inventoryStatus = "Rejected by approver";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateApproved`,
          {
            inventory_id: selectedRow.inventory_id,
            inventory_inward_status: inventoryStatus,
            approved_at: actionedAt,
            approved_by: actionedBy,
            approver_comments: comment,
          },
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        alert("Inventory rejected successfully!");
      } catch (error) {
        console.error("Error submitting materials:", error);
        setError("Failed to submit materials");
      }
    }
  };

  const handleApprove = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
    const actionedBy = user.name || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });

    if (inventoryStatusPass.toLowerCase() === "pending for receipt") {
      inventoryStatus = "Pending for approval";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateReceived`,
          {
            inventory_id: selectedRow.inventory_id,
            inventory_inward_status: inventoryStatus,
            received_at: actionedAt,
            received_by: actionedBy,
            inventory_approver_email: selectedApproverEmail,
            inventory_approver_name: approverName,
            receiver_comments: comment,
          },
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
      } catch (error) {
        console.error("Error submitting materials:", error);
        setError("Failed to submit materials");
      }
    }
    if (inventoryStatusPass.toLowerCase() === "pending for approval") {
      inventoryStatus = "Approved";
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/inventory/updateApproved`,
          {
            inventory_id: selectedRow.inventory_id,
            inventory_inward_status: inventoryStatus,
            approved_at: actionedAt,
            approved_by: actionedBy,
            approver_comments: comment,
            material_stock: inventoryMaterial,
            warehouse_id: selectedRow.warehouse_id,
          },
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        alert("Inventory approved successfully!");
      } catch (error) {
        console.error("Error submitting materials:", error);
        setError("Failed to submit materials");
      }
    }
  };

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
          onClick={() => handleOpenModal(row.original)}
        >
          {"INV-" + row.original.inventory_id} {}{" "}
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
      accessorKey: "warehouse_id",
      header: "Warehouse ID",
      size: 200,
      filterFn: "contains",
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
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

    {
      accessorKey: "created_at",
      header: "Created Dt",
      size: 150,
      Cell: ({ cell }) => cell.getValue(),
    },

    {
      accessorKey: "inventory_approver_email",
      header: "Approver Email",
      size: 150,
      filterFn: "contains",
    },

    {
      accessorKey: "inventory_receiver_name",
      header: "Receiver Name",
      size: 200,
    },
    {
      accessorKey: "inventory_approver_name",
      header: "Approver Name",
      size: 200,
    },

    {
      accessorKey: "customer_name",
      header: "Customer Name",
      filterVariant: "multi-select",
      filterFn: "contains",
      size: 250,
    },
  ]);

  const handleExportRows = (rows) => {
    const flattened = [];

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
      useKeysAsHeaders: true,
    });

    const csv = generateCsv(csvConfig)(flattened);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: false,

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
        borderRadius: "16px",
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
        borderRadius: "16px",
      }}
    >
      {}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() => {
            const filteredRows = table.getFilteredRowModel().rows;

            const allOriginalData = filteredRows.map((row) => {
              const { materials, ...rest } = row.original;
              return rest;
            });

            handleExportRows(allOriginalData);
          }}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          sx={{
            color: "black",
            backgroundColor: "#ec7c30",
            height: "35px",
            padding: "10px 20px",
            borderRadius: "8px",
            marginTop: "-45px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black",
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          Export
        </Button>
      </Box>

      {}
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
            {}
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
            </Box>
          </Box>
        )}
      />

      {}
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
        username={user}
      />
    </Box>
  );
};

export default Example;
