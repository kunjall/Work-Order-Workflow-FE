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
import MmModal from "./MmModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, []);
  const [mmMaterial, setMmMaterial] = useState([]);
  const [locatorStock, setLocatorStock] = useState([]);
  const [allMmMaterial, setAllMmMaterial] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");
  const [comment, setComment] = useState("");

  const [mmStatusPass, setMmStatusPass] = useState("");

  let mmStatus;

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setMmStatusPass(row ? row.mm_status : "");
    setOpen(true); // Open the modal
  };

  useEffect(() => {
    // Reset the comment whenever a new request is selected
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false); // Close the modal
  };
  const handleProvidedQtyChange = (e, index) => {
    const newValue = e.target.value ? parseInt(e.target.value, 10) : 0; // Convert input to a number

    // Check if the entered value exceeds the balance quantity

    setError(null); // Clear error message if valid
    setMmMaterial((prev) =>
      prev.map((material, i) =>
        i === index ? { ...material, issued_qty: newValue } : material
      )
    );
  };

  useEffect(() => {
    if (selectedRow !== null) {
      console.log(selectedRow);
      const fetchMmMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/mm/find-material-mm?mm_id=${selectedRow.mm_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          console.log(response.data);

          const MmMaterialArray = response.data.map((material) => ({
            record_id: material.record_id,
            mm_id: material.mm_id,
            cwo_id: material.cwo_id,
            cwo_number: material.cwo_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_req_qty: material.material_req_qty,
            material_bal_qty: material.material_cwo_bal_qty,
            material_unit_price: material.material_unit_price,
            material_price: material.material_price,
            material_provided_qty: material.material_provided_qty,
          }));
          console.log(MmMaterialArray);
          setMmMaterial(MmMaterialArray);
        } catch (err) {
          console.error("Error fetching child materials:", err);
          setError("Failed to load child materials");
        }
      };

      fetchMmMaterial();
    }
  }, [selectedRow]);

  useEffect(() => {
    const fetchAllChildMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/mm/find-all-mm-material`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const mmMaterialArray = response.data.map((material) => ({
          record_id: material.record_id,
          mm_id: material.mm_id,
          cwo_id: material.cwo_id,
          cwo_number: material.cwo_number,
          material_id: material.material_id,
          material_desc: material.material_desc,
          material_uom: material.material_uom,
          material_req_qty: material.material_req_qty,
          material_cwo_bal_qty: material.material_cwo_bal_qty,
          material_unit_price: material.material_unit_price,
          material_price: material.material_price,
          material_provided_qty: material.material_provided_qty,
        }));
        setAllMmMaterial(mmMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllChildMaterial();
  }, []);

  useEffect(() => {
    const fetchLocatorStock = async () => {
      if (selectedRow && selectedRow.locator_name && mmMaterial.length > 0) {
        try {
          const promises = mmMaterial.map((item) =>
            axios.get(
              `${process.env.REACT_APP_API_URL}/mm/find-material-stock`,
              {
                params: {
                  material_id: item.material_id,
                  locator_name: selectedRow.locator_name,
                },
                headers: {
                  Authorization: user.authToken,
                },
              }
            )
          );

          const responses = await Promise.all(promises);
          const locatorData = responses.map((response) => response.data);
          console.log(responses);

          setLocatorStock(locatorData.flat());
        } catch (err) {
          console.error("Error fetching locators:", err);
          setError("Failed to load locators");
        }
      }
    };

    if (selectedRow && selectedRow.locator_name) {
      fetchLocatorStock();
    }
  }, [selectedRow, mmMaterial]);

  useEffect(() => {
    if (locatorStock.length > 0 && mmMaterial.length > 0) {
      const updatedMaterialLineItems = mmMaterial.map((item) => {
        const matchedLocator = locatorStock.find(
          (locator) => locator.material_id === item.material_id
        );
        return {
          ...item,
          locator_stock: matchedLocator ? matchedLocator.stock_qty : 0,
        };
      });

      setMmMaterial((prev) => {
        const isSame =
          JSON.stringify(prev) === JSON.stringify(updatedMaterialLineItems);
        return isSame ? prev : updatedMaterialLineItems;
      });
      console.log(updatedMaterialLineItems);
    }
  }, [locatorStock]);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;

    const fetchMmData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending with deployment head",
          "Pending with material incharge",
          "Pending with material head",
          "Rejected by deployment head",
          "Rejected by material incharge",
          "Rejected by material head",
          "Waiting for acknowledgement",
          "Received",
          "Not received",
        ];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/mm/find-mm-actions?user=${username}&mmstatus=${status}`,
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
          console.log(combinedData); // Log combined data for debugging
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load MM");
          setIsLoading(false);
        }
        console.error("Error fetching MM data:", err);
      }
    };

    fetchMmData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  useEffect(() => {
    if (selectedRow != null && selectedRow.execution_city != null) {
      console.log(selectedRow);
      const fetchApprovers = async () => {
        try {
          console.log(selectedRow, "117");
          console.log(selectedRow.warehouse_city);
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MM&city=${selectedRow.execution_city}`,
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
            approver2_email: reviewer.approver2_email,
            approver2_name: reviewer.approver2_name,
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
    const actionedBy = user.username || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // AM/PM format
      timeZone: "IST", // Adjust to UTC
    });
    if (mmStatusPass === "Pending with deployment head") {
      mmStatus = "Rejected by deployment head";
    } else if (mmStatusPass === "Pending with material incharge") {
      mmStatus = "Rejected by material incharge";
    } else if (mmStatusPass === "Pending with material head") {
      mmStatus = "Rejected by material head";
    } else if (mmStatusPass === "Waiting for acknowledgement") {
      mmStatus = "Not received";
    }

    console.log("Approved", 278);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/mm/reject-mm`,
        {
          mm_id: selectedRow.mm_id,
          cwo_id: selectedRow.cwo_id, // Ensure this is passed to your modal
          mm_status: mmStatus,
          actioned_at: actionedAt,
          actioned_by: actionedBy,
          approver_comments: comment,
        },
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );
      console.log(response.data.message);
      alert("Work order rejected successfully!");
    } catch (err) {
      console.error("Error rejecting work order:", err);
      alert("Failed to reject work order. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (mmStatusPass === "Pending with deployment head") {
      mmStatus = "Pending with material incharge";
    } else if (mmStatusPass === "Pending with material incharge") {
      mmStatus = "Pending with material head";
    } else if (mmStatusPass === "Pending with material head") {
      mmStatus = "Waiting for acknowledgement";
    } else if (mmStatusPass === "Waiting for acknowledgement") {
      mmStatus = "Received";
    }
    const actionedBy = user.username || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // AM/PM format
      timeZone: "IST", // Adjust to UTC
    });
    console.log(mmStatusPass);

    const requestData = {
      mm_id: selectedRow.mm_id,
      cwo_id: selectedRow.cwo_id, // Ensure this is passed to your modal
      mm_status: mmStatus,
      mm_approver2_email: selectedApproverEmail,
      mm_approver2_name: approverName,
      mm_approver3_email:
        mmStatusPass === "Pending with material incharge"
          ? selectedApproverEmail || ""
          : null,
      mm_approver3_name: "Pending with material incharge"
        ? approverName || ""
        : null,
      actioned_at: actionedAt,
      actioned_by: actionedBy,
      approver_comments: comment,
      warehouse_id: selectedRow.warehouse_id,
      locator_name: selectedRow.locator_name,
      mmMaterial:
        mmStatusPass === "Pending with material head" ||
        mmStatusPass.includes("acknowledgement")
          ? mmMaterial || []
          : undefined,
    };

    // Remove the key if it's undefined to avoid sending it unnecessarily
    if (requestData.mmMaterial === undefined) {
      delete requestData.mmMaterial;
    }

    // Include materialLineItems if mmStatusPass meets the criteria

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/mm/update-approve-mm`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );
    } catch (error) {
      console.error("Error in approving: ", error);
      setError("Failed to Approve");
    }
  };

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: "mm_id",
      header: "MM Id",
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
          {"MM-" + row.original.mm_id} {/* Prefix with "cwo_" */}{" "}
        </span>
      ),
    },
    {
      accessorKey: "cwo_number",
      header: "CWO Number",
      size: 200,
      filterFn: "contains",
    },

    {
      accessorKey: "route_name",
      header: "Route Name",
      size: 200,
      filterFn: "contains",
    },
    {
      accessorKey: "mm_status",
      header: "MM Status",
      size: 200,
      filterFn: "contains",
    },
    {
      accessorKey: "execution_city",
      header: "Execution City",
      size: 150,
      Cell: ({ cell }) => cell.getValue(), // Format date
      // filterFn: "contains",
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
      Cell: ({ cell }) => cell.getValue(), // Format date
      // filterFn: "contains",
    },
    {
      accessorKey: "customer_name",
      header: "Customer Name",
      filterVariant: "multi-select",
      filterFn: "contains",
      size: 250,
    },
    {
      accessorKey: "approved_by",
      header: "Approved By",
      size: 150,
      filterFn: "contains",
    },
    {
      accessorKey: "approved_at",
      header: "Approved Dt",
      size: 150,
      filterFn: "contains",
    },
  ]);

  const handleExportRows = (rows) => {
    const flattened = [];
    console.log(rows);

    rows.forEach((mm) => {
      console.log(mm.mm_id);
      // Merge materials
      const materials = allMmMaterial.filter(
        (mat) => mat.mm_id === String(mm.mm_id)
      );

      // Merge service
      console.log(allMmMaterial);
      console.log(materials);

      // Combine materials and services with the main data
      if (materials.length > 0) {
        // Add each material as a separate row
        materials.forEach((mat) => {
          console.log(mat);
          console.log("test");
          flattened.push({
            ...mm,
            material_id: mat.material_id,
            material_desc: mat.material_desc,
            material_uom: mat.material_uom,
            material_req_qty: mat.material_req_qty,
            material_bal_qty: mat.material_cwo_bal_qty,
            material_price: mat.material_price,
            material_unit_price: mat.material_unit_price,
            material_provided_qty: mat.material_provided_qty,
          });
        });

        // Add each service as a separate row
      } else {
        // Push a row without material if no materials exist

        flattened.push({
          ...mm,
          material_id: "",
          material_desc: "",
          material_uom: "",
          material_req_qty: "",
          material_bal_qty: "",
          material_price: "",
          material_unit_price: "",
          material_provided_qty: "",
        });
      }
    });

    const csvConfig = mkConfig({
      filename: `MWO_${username}`,
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
      <MmModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        mmMaterial={mmMaterial}
        setComment={setComment}
        comment={comment}
        handleApprove={handleApprove}
        mmStatus={mmStatusPass}
        handleReject={handleReject}
        username={username}
        approvers={approvers}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}
        setMmMaterial={setMmMaterial}
        handleProvidedQtyChange={handleProvidedQtyChange}
      />
    </Box>
  );
};

export default Example;
