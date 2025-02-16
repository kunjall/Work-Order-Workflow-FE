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
import MwoModal from "./mwoModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, []);
  const [motherMaterial, setMotherMaterial] = useState([]);
  const [motherService, setMotherService] = useState([]);
  const [allMotherMaterial, setAllMotherMaterial] = useState([]);
  const [allMotherService, setAllMotherService] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");
  const [comment, setComment] = useState("");

  const [mwoStatusPass, setMwoStatusPass] = useState("");

  let mwoStatus;

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setMwoStatusPass(row ? row.mwo_status : "");
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
      const fetchMwoMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-material?mwo_id=${selectedRow.mwo_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          console.log(response.data);

          const motherMaterialArray = response.data.map((material) => ({
            record_id: material.record_id,
            mwo_id: material.mwo_id,
            mwo_number: material.mwo_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_wo_qty: material.material_wo_qty,
            material_bal_qty: material.material_bal_qty,
            material_rate: material.material_rate,
            material_price: material.material_price,
          }));
          console.log(motherMaterialArray);
          setMotherMaterial(motherMaterialArray);
        } catch (err) {
          console.error("Error fetching mother materials:", err);
          setError("Failed to load mother materials");
        }
      };

      const fetchMwoService = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-services?mwo_id=${selectedRow.mwo_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          console.log(response.data);

          const motherServiceArray = response.data.map((service) => ({
            record_id: service.record_id,
            mwo_id: service.mwo_id,
            mwo_number: service.mwo_number,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_wo_qty: service.service_wo_qty,
            service_bal_qty: service.service_bal_qty,
            service_rate: service.service_rate,
            material_price: service.service_price,
          }));
          console.log(motherServiceArray);
          setMotherService(motherServiceArray);
        } catch (err) {
          console.error("Error fetching mother services:", err);
          setError("Failed to load mother materials");
        }
      };

      fetchMwoMaterial();
      fetchMwoService();
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
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MWO&city=${selectedRow.execution_city}`,
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
    const fetchAllMotherMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-mother-material`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const motherMaterialArray = response.data.map((material) => ({
          record_id: material.record_id,
          mwo_id: material.mwo_id,
          mwo_number: material.mwo_number,
          material_id: material.material_id,
          material_desc: material.material_desc,
          material_uom: material.material_uom,
          material_wo_qty: material.material_wo_qty,
          material_bal_qty: material.material_bal_qty,
          material_rate: material.material_rate,
          material_price: material.material_price,
        }));
        console.log(motherMaterialArray);
        setAllMotherMaterial(motherMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllMotherMaterial();
  }, []);

  useEffect(() => {
    const fetchAllMotherService = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-mother-service`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const motherServiceArray = response.data.map((service) => ({
          record_id: service.record_id,
          mwo_id: service.mwo_id,
          mwo_number: service.mwo_number,
          service_id: service.service_id,
          service_desc: service.service_desc,
          service_uom: service.service_uom,
          service_wo_qty: service.service_wo_qty,
          service_bal_qty: service.service_bal_qty,
          service_rate: service.service_rate,
          material_price: service.service_price,
        }));
        console.log(motherServiceArray);
        setAllMotherService(motherServiceArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllMotherService();
  }, []);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;

    const fetchMwoData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending with deployment head",
          "Pending with head row",
          "Pending with billing spoc",
          "Approved",
          "Rejected by deployment head",
          "Rejected by with head row",
          "Rejected by with billing spoc",
        ];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-workorder-actions?user=${username}&mwostatus=${status}`,
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

    fetchMwoData();

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
    if (mwoStatusPass === "Pending with deployment head") {
      mwoStatus = "Rejected by deployment head";
    } else if (mwoStatusPass === "Pending with head row") {
      mwoStatus = "Rejected by head row";
    } else if (mwoStatusPass === "Pending with billing spoc") {
      mwoStatus = "Rejected by billing spoc";
    }

    console.log("Approved", 278);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/workorder/update-status`,
        {
          mwo_id: selectedRow.mwo_id, // Ensure this is passed to your modal
          mwo_status: mwoStatus, // Ensure this is passed to your modal
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
      console.log(response.data.message);
      alert("Work order rejected successfully!");
    } catch (err) {
      console.error("Error rejecting work order:", err);
      alert("Failed to reject work order. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (mwoStatusPass === "Pending with deployment head") {
      mwoStatus = "Pending with head row";
    } else if (mwoStatusPass === "Pending with head row") {
      mwoStatus = "Pending with billing spoc";
    } else if (mwoStatusPass === "Pending with billing spoc") {
      mwoStatus = "Approved";
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

    console.log(selectedApproverEmail);

    const requestData = {
      mwo_id: selectedRow.mwo_id, // Ensure this is passed to your modal
      mwo_status: mwoStatus,
      approved_at: actionedAt,
      approved_by: actionedBy,
      approver_comments: comment,
      mwo_approver1_email:
        mwoStatusPass === "Pending with deployment head"
          ? selectedApproverEmail || selectedRow.mwo_approver1_email || ""
          : selectedRow.mwo_approver1_email || "",
      mwo_approver1_name:
        mwoStatusPass === "Pending with deployment head"
          ? approverName || selectedRow.mwo_approver1_name || ""
          : selectedRow.mwo_approver1_name || "",

      mwo_approver2_email:
        mwoStatusPass === "Pending with head row"
          ? selectedApproverEmail || selectedRow.mwo_approver2_email || ""
          : selectedRow.mwo_approver2_email || "",
      mwo_approver2_name:
        mwoStatusPass === "Pending with head row"
          ? approverName || selectedRow.mwo_approver2_name || ""
          : selectedRow.mwo_approver3_name || "",
    };
    console.log(requestData);
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/workorder/update-status`,
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
      accessorKey: "mwo_id",
      header: "MWO Id",
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
          {"MWO-" + row.original.mwo_id} {/* Prefix with "mwo_" */}{" "}
        </span>
      ),
    },
    {
      accessorKey: "mwo_number",
      header: "MWO Number",
      size: 200,
      filterFn: "contains",
    },

    {
      accessorKey: "mwo_status",
      header: "MWO Status",
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
      accessorKey: "route_name",
      header: "Route Name",
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
    // {
    //   accessorKey: "inventory_receiver_name",
    //   header: "Receiver Name",
    //   size: 200,
    //   // filterFn: "contains",
    // },
    // {
    //   accessorKey: "inventory_approver_name",
    //   header: "Approver Name",
    //   size: 200,
    //   // filterFn: "contains",
    // },
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

    rows.forEach((mwo) => {
      console.log(mwo.mwo_id);
      // Merge materials
      const materials = allMotherMaterial.filter(
        (mat) => mat.mwo_id === String(mwo.mwo_id)
      );

      // Merge services
      const services = allMotherService.filter(
        (srv) => srv.mwo_id === String(mwo.mwo_id)
      );

      console.log(allMotherService);
      console.log(allMotherMaterial);
      console.log(services);
      console.log(materials);

      // Combine materials and services with the main data
      if (materials.length > 0 || services.length > 0) {
        console.log("testettete");
        // Add each material as a separate row
        materials.forEach((mat) => {
          flattened.push({
            ...mwo,
            // material_id: mat.material_id,
            // material_desc: mat.material_desc,
            // material_uom: mat.material_uom,
            // material_wo_qty: mat.material_wo_qty,
            // material_bal_qty: mat.material_wo_qty,
            // material_price: mat.material_price,
            // material_rate: mat.material_rate,
            category: "Material",
            item_id: mat.material_id,
            item_desc: mat.material_desc,
            item_uom: mat.material_uom,
            item_wo_qty: mat.material_wo_qty,
            item_bal_qty: mat.material_wo_qty,
            item_price: mat.material_price,
            item_rate: mat.material_rate,
            // service_id: "",
            // service_desc: "",
            // service_uom: "",
            // service_wo_qty: "",
            // service_bal_qty: "",
            // service_price: "",
            // service_rate: "",
          });
        });

        // Add each service as a separate row
        services.forEach((srv) => {
          flattened.push({
            ...mwo,
            // material_id: "",
            // material_desc: "",
            // material_uom: "",
            // material_wo_qty: "",
            // material_bal_qty: "",
            // material_price: "",
            // material_rate: "",
            // service_id: srv.service_id,
            // service_desc: srv.service_desc,
            // service_uom: srv.service_uom,
            // service_wo_qty: srv.service_wo_qty,
            // service_bal_qty: srv.service_bal_qty,
            // service_price: srv.service_price,
            // service_rate: srv.service_rate,
            category: "Service",
            item_id: srv.service_id,
            item_desc: srv.service_desc,
            item_uom: srv.service_uom,
            item_wo_qty: srv.service_wo_qty,
            item_bal_qty: srv.service_bal_qty,
            item_price: srv.service_price,
            item_rate: srv.service_rate,
          });
        });
      } else {
        // Push a row without material if no materials exist

        flattened.push({
          ...mwo,
          material_id: "",
          material_desc: "",
          material_uom: "",
          material_wo_qty: "",
          material_bal_qty: "",
          material_price: "",
          material_rate: "",
          service_id: "",
          service_desc: "",
          service_uom: "",
          service_wo_qty: "",
          service_bal_qty: "",
          service_price: "",
          service_rate: "",
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
      <MwoModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        motherMaterial={motherMaterial}
        motherService={motherService}
        setComment={setComment}
        comment={comment}
        handleApprove={handleApprove}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}
        approvers={approvers}
        mwoStatus={mwoStatusPass}
        handleReject={handleReject}
        username={username}
      />
    </Box>
  );
};

export default Example;
