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
import MBModal from "./mbModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, []);
  const [mbMaterial, setMbMaterial] = useState([]);
  const [mbService, setMbService] = useState([]);
  const [allMbMaterial, setAllMbMaterial] = useState([]);
  const [allMbService, setAllMbService] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");
  const [comment, setComment] = useState("");
  const [approvers, setApprovers] = useState([]);

  const [mbStatusPass, setMbStatusPass] = useState("");

  let mbStatus;

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setMbStatusPass(row ? row.mb_status : "");
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
      const fetchMBMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/mb/find-material-mb?mb_id=${selectedRow.mb_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          console.log(response.data);

          const mbMaterialArray = response.data.map((material) => ({
            record_id: material.record_id,
            cwo_id: material.cwo_id,
            cwo_number: material.cwo_number,
            mb_id: material.mb_id,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_log_qty: material.material_log_qty,
            material_unit_price: material.material_unit_price,
            material_price: material.material_price,
          }));
          console.log(mbMaterialArray);
          setMbMaterial(mbMaterialArray);
        } catch (err) {
          console.error("Error fetching child materials:", err);
          setError("Failed to load child materials");
        }
      };

      const fetchMBService = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/mb/find-service-mb?mb_id=${selectedRow.mb_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          console.log(response.data);

          const mbServiceArray = response.data.map((service) => ({
            record_id: service.record_id,
            cwo_id: service.cwo_id,
            cwo_number: service.cwo_number,
            mb_id: service.mb_id,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_log_qty: service.service_log_qty,
            service_unit_price: service.service_unit_price,
            service_price: service.service_price,
          }));
          console.log(mbServiceArray);
          setMbService(mbServiceArray);
        } catch (err) {
          console.error("Error fetching child services:", err);
          setError("Failed to load child materials");
        }
      };

      fetchMBMaterial();
      fetchMBService();
    }
  }, [selectedRow]);
  useEffect(() => {
    if (selectedRow != null && selectedRow.execution_city != null) {
      console.log(selectedRow);
      const fetchApprovers = async () => {
        try {
          console.log(selectedRow, "117");
          // console.log(selectedRow.warehouse_city);
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MB&city=${selectedRow.execution_city}`,
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
            approver3_email: reviewer.approver3_email,
            approver3_name: reviewer.approver3_name,
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

  useEffect(() => {
    const fetchAllMbMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/mb/find-material-mb`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const mbMaterialArray = response.data.map((material) => ({
          record_id: material.record_id,
          cwo_id: material.cwo_id,
          cwo_number: material.cwo_number,
          mb_id: material.mb_id,
          material_id: material.material_id,
          material_desc: material.material_desc,
          material_uom: material.material_uom,
          material_log_qty: material.material_log_qty,
          material_unit_price: material.material_unit_price,
          material_price: material.material_price,
        }));
        console.log(mbMaterialArray);
        setAllMbMaterial(mbMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllMbMaterial();
  }, []);

  useEffect(() => {
    const fetchAllMbService = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/mb/find-service-mb`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const mbServiceArray = response.data.map((service) => ({
          record_id: service.record_id,
          cwo_id: service.cwo_id,
          cwo_number: service.cwo_number,
          mb_id: service.mb_id,
          service_id: service.service_id,
          service_desc: service.service_desc,
          service_uom: service.service_uom,
          service_log_qty: service.service_log_qty,
          service_unit_price: service.service_unit_price,
          service_price: service.service_price,
        }));
        console.log(mbServiceArray);
        setAllMbService(mbServiceArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllMbService();
  }, []);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;

    const fetchMbData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending with TPM",
          "Pending with deployment head",
          "Pending with material head",
          "Pending with billing spoc",
          "Approved",
          "Rejected by TPM",
          "Rejected by deployment head",
          "Rejected by material head",
          "Rejected by billing spoc",
        ];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/mb/find-mb-actions?user=${username}&mbstatus=${status}`,
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
          setError("Failed to load inventory");
          setIsLoading(false);
        }
        console.error("Error fetching inventory data:", err);
      }
    };

    fetchMbData();

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
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=CWO&city=${selectedRow.warehouse_city}`,
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
          console.log(approverArray, "138");
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
    if (mbStatusPass === "Pending with TPM") {
      mbStatus = "Rejected by TPM";
    } else if (mbStatusPass === "Pending with deployment head") {
      mbStatus = "Rejected by deployment head";
    } else if (mbStatusPass === "Pending with material head") {
      mbStatus = "Rejected by material head";
    } else if (mbStatusPass === "Pending with billing spoc") {
      mbStatus = "Rejected";
    }

    console.log("Approved", 278);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/mb/reject-mb`,
        {
          mb_id: selectedRow.mb_id,
          cwo_id: selectedRow.cwo_id, // Ensure this is passed to your modal
          mb_status: mbStatus,
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
    if (mbStatusPass === "Pending with TPM") {
      mbStatus = "Pending with deployment head";
    } else if (mbStatusPass === "Pending with deployment head") {
      mbStatus = "Pending with material head";
    } else if (mbStatusPass === "Pending with material head") {
      mbStatus = "Pending with billing spoc";
    } else if (mbStatusPass === "Pending with billing spoc") {
      mbStatus = "Approved";
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
    console.log(mbStatusPass);

    const requestData = {
      mb_id: selectedRow.mb_id,
      cwo_id: selectedRow.cwo_id, // Ensure this is passed to your modal
      mb_status: mbStatus,

      // Preserve existing approver details unless the status requires a change
      mb_approver2_email:
        selectedApproverEmail || selectedRow.mb_approver2_email || "",
      mb_approver2_name: approverName || selectedRow.mb_approver2_name || "",

      mb_approver3_email:
        mbStatusPass === "Pending with deployment head"
          ? selectedApproverEmail || selectedRow.mb_approver3_email || ""
          : selectedRow.mb_approver3_email || "",
      mb_approver3_name:
        mbStatusPass === "Pending with deployment head"
          ? approverName || selectedRow.mb_approver3_name || ""
          : selectedRow.mb_approver3_name || "",

      mb_approver4_email:
        mbStatusPass === "Pending with material head"
          ? selectedApproverEmail || selectedRow.mb_approver4_email || ""
          : selectedRow.mb_approver4_email || "",
      mb_approver4_name:
        mbStatusPass === "Pending with material head"
          ? approverName || selectedRow.mb_approver4_name || ""
          : selectedRow.mb_approver4_name || "",

      actioned_at: actionedAt,
      actioned_by: actionedBy,
      approver_comments: comment,

      // Preserve other relevant data
      locator_name: selectedRow.locator_name,

      mbMaterial:
        mbStatusPass === "Pending with billing spoc"
          ? mbMaterial || []
          : undefined,
      mbService:
        mbStatusPass === "Pending with billing spoc"
          ? mbService || []
          : undefined,
    };

    // Remove the key if it's undefined to avoid sending it unnecessarily
    if (requestData.mbMaterial === undefined) {
      delete requestData.mbMaterial;
    }

    // Include materialLineItems if mmStatusPass meets the criteria

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/mb/update-approve-mb`,
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
      accessorKey: "mb_id",
      header: "MB Id",
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
          {"MB-" + row.original.mb_id} {/* Prefix with "cwo_" */}{" "}
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
      accessorKey: "mb_status",
      header: "MB Status",
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
  ]);

  const handleExportRows = (rows) => {
    const flattened = [];
    console.log(rows);

    rows.forEach((mb) => {
      console.log(mb.mb_id);
      // Merge materials
      const materials = allMbMaterial.filter(
        (mat) => mat.mb_id === String(mb.mb_id)
      );

      // Merge services
      const services = allMbService.filter(
        (srv) => srv.mb_id === String(mb.mb_id)
      );

      // console.log(allChildService);
      // console.log(allChildMaterial);
      console.log(services);
      console.log(materials);

      // Combine materials and services with the main data
      if (materials.length > 0 || services.length > 0) {
        console.log("testettete");
        // Add each material as a separate row
        materials.forEach((mat) => {
          flattened.push({
            ...mb,
            material_id: mat.material_id,
            material_desc: mat.material_desc,
            material_uom: mat.material_uom,
            material_log_qty: mat.material_log_qty,
            material_unit_price: mat.material_unit_price,
            material_price: mat.material_price,
            service_id: "",
            service_desc: "",
            service_uom: "",
            service_log_qty: "",
            service_unit_price: "",
            service_price: "",
          });
        });

        // Add each service as a separate row
        services.forEach((srv) => {
          flattened.push({
            ...mb,
            material_id: "",
            material_desc: "",
            material_uom: "",
            material_log_qty: "",
            material_unit_price: "",
            material_price: "",
            service_id: srv.service_id,
            service_desc: srv.service_desc,
            service_uom: srv.service_uom,
            service_log_qty: srv.service_log_qty,
            service_unit_price: srv.service_unit_price,
            service_price: srv.service_price,
          });
        });
      } else {
        // Push a row without material if no materials exist

        flattened.push({
          ...mb,

          material_id: "",
          material_desc: "",
          material_uom: "",
          material_log_qty: "",
          material_unit_price: "",
          material_price: "",
          service_id: "",
          service_desc: "",
          service_uom: "",
          service_log_qty: "",
          service_unit_price: "",
          service_price: "",
        });
      }
    });

    const csvConfig = mkConfig({
      filename: `MB_${username}`,
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
      <MBModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        childMaterial={mbMaterial}
        childService={mbService}
        setComment={setComment}
        comment={comment}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}
        handleApprove={handleApprove}
        mbStatus={mbStatusPass}
        handleReject={handleReject}
        username={username}
        approvers={approvers}
      />
    </Box>
  );
};

export default Example;
