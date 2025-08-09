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
import MwoCrModal from "./mwoCrModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const DashboardRequestsMwoCr = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, [user]);
  const [crMaterials, setCrMaterials] = useState([]);
  const [crServices, setCrServices] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [crStatusPass, setCrStatusPass] = useState("");
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setCrStatusPass(row ? row.cr_status : "");
    setOpen(true);
  };

  useEffect(() => {
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false);
  };

  // Fetch materials for a specific change request
  useEffect(() => {
    if (selectedRow != null) {
      const fetchCrMaterials = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/change-request/mwo/materials/${selectedRow.cr_mwo_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          setCrMaterials(response.data.data || []);
        } catch (err) {
          console.error("Error fetching CR materials:", err);
          setError("Failed to load CR materials");
        }
      };

      const fetchCrServices = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/change-request/mwo/services/${selectedRow.cr_mwo_id}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          setCrServices(response.data.data || []);
        } catch (err) {
          console.error("Error fetching CR services:", err);
          setError("Failed to load CR services");
        }
      };

      fetchCrMaterials();
      fetchCrServices();
    }
  }, [selectedRow, user.authToken]);

  // Fetch change requests
  useEffect(() => {
    let isMounted = true;

    const fetchChangeRequests = async () => {
      setIsLoading(true);
      try {
        const statuses = ["Pending Approval", "Approved", "Rejected"];

        // Get change requests where the user is the approver or based on role
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/change-request/mwo/find`,
          {
            params: {
              cr_approver_email: user.role.includes("admin")
                ? undefined
                : user.username,
            },
            headers: { Authorization: user.authToken },
          }
        );

        if (isMounted) {
          const data = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setTableData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load change requests");
          setIsLoading(false);
        }
        console.error("Error fetching change request data:", err);
      }
    };

    fetchChangeRequests();

    return () => {
      isMounted = false;
    };
  }, [username, user.authToken, user.role, refreshKey, user.username]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=CRMWO`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        console.log("Approvers response:", response.data);

        const approverArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          reviewer_email: reviewer.approver_email,
          city: reviewer.city,
          reviewer_name: reviewer.approver_name,
          approver2_email: reviewer.approver2_email,
          approver2_name: reviewer.approver2_name,
          approver3_email: reviewer.approver3_email,
          approver3_name: reviewer.approver3_name,
        }));

        console.log("Mapped approvers:", approverArray);
        setApprovers(approverArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };
    fetchApprovers();
  }, [selectedRow, user.authToken]);

  const handleReject = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to reject this change request?"
    );
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

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/change-request/mwo/update-status/${selectedRow.cr_mwo_id}`,
        {
          cr_status: "Rejected",
          actioned_by: actionedBy,
          actioned_at: actionedAt,
          approver_comments: comment,
        },
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      alert("Change request rejected successfully!");
      handleCloseModal();
    } catch (err) {
      console.error("Error rejecting change request:", err);
      alert("Failed to reject change request. Please try again.");
    }
  };

  const handleApprove = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to approve this change request?"
    );
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

    try {
      // Determine which approver level this is
      const isPendingForX =
        selectedRow.cr_status === "Pending for approval deployment head";
      const isPendingForY =
        selectedRow.cr_status === "Pending for approval acquisition head";
      const isPendingForZ =
        selectedRow.cr_status === "Pending for approval head operations";

      console.log("Approval status check:", {
        status: selectedRow.cr_status,
        isPendingForX,
        isPendingForY,
        isPendingForZ,
      });

      // Prepare request data
      let requestData = {
        actioned_by: actionedBy,
        actioned_at: actionedAt,
        approver_comments: comment,
      };

      // If this is the first approver, set status to pending for second approver
      if (isPendingForX) {
        if (!selectedApproverEmail || !approverName) {
          alert("Please select a second approver before approving.");
          return;
        }
        requestData = {
          ...requestData,
          cr_status: "Pending for approval acquisition head",
          cr_approver2_email: selectedApproverEmail,
          cr_approver2_name: approverName,
        };
      }
      // If this is the second approver, set status to pending for third approver
      else if (isPendingForY) {
        if (!selectedApproverEmail || !approverName) {
          alert("Please select a third approver before approving.");
          return;
        }
        requestData = {
          ...requestData,
          cr_status: "Pending for approval head operations",
          cr_approver3_email: selectedApproverEmail,
          cr_approver3_name: approverName,
        };
      }
      // If this is the third approver, set status to approved
      else if (isPendingForZ) {
        requestData.cr_status = "Approved";
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/change-request/mwo/update-status/${selectedRow.cr_mwo_id}`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      alert("Change request approved successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error approving change request:", error);
      setError("Failed to approve change request");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "cr_mwo_id",
        header: "CR Id",
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
            {"MCR-" + row.original.cr_mwo_id} {}{" "}
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
        accessorKey: "cr_status",
        header: "Status",
        size: 200,
        filterFn: "contains",
      },
      {
        accessorKey: "customer_name",
        header: "Customer Name",
        filterVariant: "multi-select",
        filterFn: "contains",
        size: 250,
      },
      {
        accessorKey: "total_material_cost",
        header: "Material Cost",
        size: 150,
        Cell: ({ cell }) => `₹${Number(cell.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "total_service_cost",
        header: "Service Cost",
        size: 150,
        Cell: ({ cell }) => `₹${Number(cell.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        size: 150,
        filterFn: "contains",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        size: 150,
        Cell: ({ cell }) => cell.getValue(),
      },
      {
        accessorKey: "actioned_by",
        header: "Actioned By",
        size: 150,
        filterFn: "contains",
      },
      {
        accessorKey: "actioned_at",
        header: "Actioned At",
        size: 150,
        filterFn: "contains",
      },
    ],
    []
  );

  const handleExportRows = async (rows) => {
    try {
      // Show loading indicator
      setIsLoading(true);

      // Prepare an array to hold all the data
      let exportData = [];

      // Process each selected row
      for (const row of rows) {
        const crId = row.original.cr_mwo_id;

        // Fetch materials for this CR
        const materialsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/change-request/mwo/materials/${crId}`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        // Fetch services for this CR
        const servicesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/change-request/mwo/services/${crId}`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const materials = materialsResponse.data.data || [];
        const services = servicesResponse.data.data || [];

        // Add the main CR data
        exportData.push({
          ...row.original,
          record_type: "CR_HEADER",
        });

        // Add materials with a type identifier
        materials.forEach((material) => {
          console.log("MWO CR Material data:", material); // Debug log
          exportData.push({
            cr_id: crId,
            record_type: "MATERIAL",
            material_id: material.material_id || "",
            description: material.material_desc || "",
            uom: material.material_uom || "",
            old_qty: material.material_old_qty || "0",
            new_qty: material.material_cr_qty || "0",
            unit_price: material.material_unit_price || "0",
            old_amount: material.old_amount || "0",
            cr_amount: material.cr_amount || "0",
            is_removed: material.is_removed ? "Yes" : "No",
            is_added: material.is_added ? "Yes" : "No",
          });
        });

        // Add services with a type identifier
        services.forEach((service) => {
          console.log("MWO CR Service data:", service); // Debug log
          exportData.push({
            cr_id: crId,
            record_type: "SERVICE",
            service_id: service.service_id || "",
            description: service.service_desc || "",
            uom: service.service_uom || "",
            old_qty: service.service_old_qty || "0",
            new_qty: service.service_cr_qty || "0",
            unit_price: service.service_unit_price || "0",
            old_amount: service.old_amount || "0",
            cr_amount: service.cr_amount || "0",
            is_removed: service.is_removed ? "Yes" : "No",
            is_added: service.is_added ? "Yes" : "No",
          });
        });
      }

      // Create a single row per CR with all data
      const formattedExportData = [];

      // Group the data by CR ID
      const groupedData = {};

      for (let i = 0; i < exportData.length; i++) {
        const item = exportData[i];
        const crId =
          item.record_type === "CR_HEADER" ? item.cr_mwo_id : item.cr_id;

        if (!groupedData[crId]) {
          groupedData[crId] = {
            header: null,
            materials: [],
            services: [],
          };
        }

        if (item.record_type === "CR_HEADER") {
          groupedData[crId].header = item;
        } else if (item.record_type === "MATERIAL") {
          groupedData[crId].materials.push(item);
        } else if (item.record_type === "SERVICE") {
          groupedData[crId].services.push(item);
        }
      }

      // For each CR, create a row with all data
      Object.keys(groupedData).forEach((crId) => {
        const group = groupedData[crId];
        if (!group.header) return;

        const header = group.header;

        // Get the first material and service (if any)
        const material1 =
          group.materials.length > 0 ? group.materials[0] : null;
        const service1 = group.services.length > 0 ? group.services[0] : null;

        // Create the main row with CR header data and first material/service
        const row = {
          cr_id: header.cr_mwo_id || "",
          mwo_number: header.mwo_number || "",
          customer_name: header.customer_name || "",
          cr_status: header.cr_status || "",
          cr_approver_email: header.cr_approver_email || "",
          cr_approver_name: header.cr_approver_name || "",
          cr_approver2_email: header.cr_approver2_email || "",
          cr_approver2_name: header.cr_approver2_name || "",
          cr_approver3_email: header.cr_approver3_email || "",
          cr_approver3_name: header.cr_approver3_name || "",
          actioned_by: header.actioned_by || "",
          actioned_at: header.actioned_at || "",
          created_by: header.created_by || "",
          created_at: header.created_at || "",
          total_material_cost: header.total_material_cost || "0",
          total_service_cost: header.total_service_cost || "0",

          // Material data (first material)
          material_id: material1 ? material1.material_id || "" : "",
          material_description: material1 ? material1.description || "" : "",
          material_uom: material1 ? material1.uom || "" : "",
          material_old_qty: material1 ? material1.old_qty || "0" : "",
          material_new_qty: material1 ? material1.new_qty || "0" : "",
          material_unit_price: material1 ? material1.unit_price || "0" : "",
          material_old_amount: material1 ? material1.old_amount || "0" : "",
          material_new_amount: material1 ? material1.cr_amount || "0" : "",
          material_is_removed: material1 ? material1.is_removed || "No" : "",
          material_is_added: material1 ? material1.is_added || "No" : "",

          // Service data (first service)
          service_id: service1 ? service1.service_id || "" : "",
          service_description: service1 ? service1.description || "" : "",
          service_uom: service1 ? service1.uom || "" : "",
          service_old_qty: service1 ? service1.old_qty || "0" : "",
          service_new_qty: service1 ? service1.new_qty || "0" : "",
          service_unit_price: service1 ? service1.unit_price || "0" : "",
          service_old_amount: service1 ? service1.old_amount || "0" : "",
          service_new_amount: service1 ? service1.cr_amount || "0" : "",
          service_is_removed: service1 ? service1.is_removed || "No" : "",
          service_is_added: service1 ? service1.is_added || "No" : "",

          record_type: "CR_HEADER",
        };

        formattedExportData.push(row);

        // Add additional rows for remaining materials
        for (let i = 1; i < group.materials.length; i++) {
          const material = group.materials[i];
          formattedExportData.push({
            cr_id: header.cr_mwo_id || "",
            mwo_number: header.mwo_number || "",
            material_id: material.material_id || "",
            material_description: material.description || "",
            material_uom: material.uom || "",
            material_old_qty: material.old_qty || "0",
            material_new_qty: material.new_qty || "0",
            material_unit_price: material.unit_price || "0",
            material_old_amount: material.old_amount || "0",
            material_new_amount: material.cr_amount || "0",
            material_is_removed: material.is_removed || "No",
            material_is_added: material.is_added || "No",
            record_type: "MATERIAL",
          });
        }

        // Add additional rows for remaining services
        for (let i = 1; i < group.services.length; i++) {
          const service = group.services[i];
          formattedExportData.push({
            cr_id: header.cr_mwo_id || "",
            mwo_number: header.mwo_number || "",
            service_id: service.service_id || "",
            service_description: service.description || "",
            service_uom: service.uom || "",
            service_old_qty: service.old_qty || "0",
            service_new_qty: service.new_qty || "0",
            service_unit_price: service.unit_price || "0",
            service_old_amount: service.old_amount || "0",
            service_new_amount: service.cr_amount || "0",
            service_is_removed: service.is_removed || "No",
            service_is_added: service.is_added || "No",
            record_type: "SERVICE",
          });
        }
      });

      // Configure and generate the CSV
      const csvConfig = mkConfig({
        filename: `MWO_ChangeRequests_${username}`,
        useKeysAsHeaders: true,
      });

      const csv = generateCsv(csvConfig)(formattedExportData);
      download(csvConfig)(csv);

      // Hide loading indicator
      setIsLoading(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
      setIsLoading(false);
    }
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
      sorting: [
        {
          id: "cr_mwo_id", // Specify the column to sort by
          desc: true, // Sort in descending order
        },
      ],
    },
    getRowId: (row) => row.cr_mwo_id,
    sortDescFirst: true,
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
        backgroundColor: "white",
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() => {
            const filteredRows = table.getFilteredRowModel().rows;
            handleExportRows(filteredRows);
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
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
            </Box>
          </Box>
        )}
      />
      <MwoCrModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        crMaterials={crMaterials}
        crServices={crServices}
        setComment={setComment}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}
        approvers={approvers}
        comment={comment}
        handleApprove={handleApprove}
        crStatus={crStatusPass}
        handleReject={handleReject}
        username={user}
      />
    </Box>
  );
};

export default DashboardRequestsMwoCr;
