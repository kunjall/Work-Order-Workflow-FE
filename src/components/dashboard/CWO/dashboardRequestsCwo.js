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
import CwoModal from "./cwoModal";
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

const Example = ({ refreshKey }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => localStorage.getItem("username"), []);
  const [childMaterial, setChildMaterial] = useState([]);
  const [childService, setChildService] = useState([]);
  const [motherMaterial, setMotherMaterial] = useState([]);
  const [motherService, setMotherService] = useState([]);
  const [allChildMaterial, setAllChildMaterial] = useState([]);
  const [allChildService, setAllChildService] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);

  const [comment, setComment] = useState("");

  const [cwoStatusPass, setCwoStatusPass] = useState("");

  let cwoStatus;

  const handleOpenModal = (row) => {
    setSelectedRow(row); // Store the row's data
    setCwoStatusPass(row ? row.cwo_status : "");
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
      const fetchCwoMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-material?cwo_id=${selectedRow.cwo_id}`,
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );

          console.log(response.data);

          const childMaterialArray = response.data.map((material) => ({
            record_id: material.record_id,
            cwo_id: material.cwo_id,
            cwo_number: material.cwo_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_wo_qty: material.material_wo_qty,
            material_bal_qty: material.material_bal_qty,
            material_rate: material.material_rate,
            material_price: material.material_price,
          }));
          console.log(childMaterialArray);
          setChildMaterial(childMaterialArray);
        } catch (err) {
          console.error("Error fetching child materials:", err);
          setError("Failed to load child materials");
        }
      };

      const fetchCwoService = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-services?cwo_id=${selectedRow.cwo_id}`,
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );

          console.log(response.data);

          const childServiceArray = response.data.map((service) => ({
            record_id: service.record_id,
            cwo_id: service.cwo_id,
            cwo_number: service.cwo_number,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_wo_qty: service.service_wo_qty,
            service_bal_qty: service.service_bal_qty,
            service_rate: service.service_rate,
            material_price: service.service_price,
          }));
          console.log(childServiceArray);
          setChildService(childServiceArray);
        } catch (err) {
          console.error("Error fetching child services:", err);
          setError("Failed to load child materials");
        }
      };

      fetchCwoMaterial();
      fetchCwoService();
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow != null) {
      console.log(selectedRow);
      const fetchMwoMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-material?mwo_id=${selectedRow.mwo_id}`,
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
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
                Authorization: `${localStorage.getItem("token")}`,
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
    const fetchAllChildMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-child-material`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        const childMaterialArray = response.data.map((material) => ({
          record_id: material.record_id,
          cwo_id: material.cwo_id,
          cwo_number: material.cwo_number,
          material_id: material.material_id,
          material_desc: material.material_desc,
          material_uom: material.material_uom,
          material_wo_qty: material.material_wo_qty,
          material_bal_qty: material.material_bal_qty,
          material_rate: material.material_rate,
          material_price: material.material_price,
        }));
        console.log(childMaterialArray);
        setAllChildMaterial(childMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllChildMaterial();
  }, []);

  useEffect(() => {
    const fetchAllChildService = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-child-service`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        const childServiceArray = response.data.map((service) => ({
          record_id: service.record_id,
          cwo_id: service.cwo_id,
          cwo_number: service.cwo_number,
          service_id: service.service_id,
          service_desc: service.service_desc,
          service_uom: service.service_uom,
          service_wo_qty: service.service_wo_qty,
          service_bal_qty: service.service_bal_qty,
          service_rate: service.service_rate,
          material_price: service.service_price,
        }));
        console.log(childServiceArray);
        setAllChildService(childServiceArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllChildService();
  }, []);

  // Fetch data from the API
  useEffect(() => {
    let isMounted = true;

    const fetchCwoData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending for approval",
          "Approved",
          "Rejected by approver",
        ];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-workorder-actions?user=${username}&cwostatus=${status}`,
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

    fetchCwoData();

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
    console.log(selectedRow);
    cwoStatus = "Rejected by approver";
    console.log("Approved", 278);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/workorder/reject-cwo`,
        {
          mwo_id: String(selectedRow.mwo_id),
          cwo_id: String(selectedRow.cwo_id),
          cwo_status: cwoStatus,
          approved_by: actionedBy,
          approved_at: actionedAt,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
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
    console.log(selectedRow);
    cwoStatus = "Approved";
    console.log("Approved", 278);
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/workorder/update-cwo-approve-status`,
        {
          cwo_id: selectedRow.cwo_id, // Ensure this is passed to your modal
          cwo_status: cwoStatus,
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
      console.error("Error in approving: ", error);
      setError("Failed to Approve");
    }
  };

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: "cwo_id",
      header: "CWO Id",
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
          {"CWO-" + row.original.cwo_id} {/* Prefix with "cwo_" */}{" "}
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
      accessorKey: "cwo_status",
      header: "CWO Status",
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

    rows.forEach((cwo) => {
      console.log(cwo.cwo_id);
      // Merge materials
      const materials = allChildMaterial.filter(
        (mat) => mat.cwo_id === String(cwo.cwo_id)
      );

      // Merge services
      const services = allChildService.filter(
        (srv) => srv.cwo_id === String(cwo.cwo_id)
      );

      console.log(allChildService);
      console.log(allChildMaterial);
      console.log(services);
      console.log(materials);

      // Combine materials and services with the main data
      if (materials.length > 0 || services.length > 0) {
        console.log("testettete");
        // Add each material as a separate row
        materials.forEach((mat) => {
          flattened.push({
            ...cwo,
            material_id: mat.material_id,
            material_desc: mat.material_desc,
            material_uom: mat.material_uom,
            material_wo_qty: mat.material_wo_qty,
            material_bal_qty: mat.material_wo_qty,
            material_price: mat.material_price,
            material_rate: mat.material_rate,
            service_id: "",
            service_desc: "",
            service_uom: "",
            service_wo_qty: "",
            service_bal_qty: "",
            service_price: "",
            service_rate: "",
          });
        });

        // Add each service as a separate row
        services.forEach((srv) => {
          flattened.push({
            ...cwo,
            material_id: "",
            material_desc: "",
            material_uom: "",
            material_wo_qty: "",
            material_bal_qty: "",
            material_price: "",
            material_rate: "",
            service_id: srv.service_id,
            service_desc: srv.service_desc,
            service_uom: srv.service_uom,
            service_wo_qty: srv.service_wo_qty,
            service_bal_qty: srv.service_bal_qty,
            service_price: srv.service_price,
            service_rate: srv.service_rate,
          });
        });
      } else {
        // Push a row without material if no materials exist

        flattened.push({
          ...cwo,
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
      <CwoModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        childMaterial={childMaterial}
        childService={childService}
        setComment={setComment}
        comment={comment}
        handleApprove={handleApprove}
        cwoStatus={cwoStatusPass}
        handleReject={handleReject}
        username={username}
      />
    </Box>
  );
};

export default Example;
