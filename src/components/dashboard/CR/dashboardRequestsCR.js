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
import CrModal from "./crModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const DashboardRequestsCR = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, []);
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

  console.log(selectedRow);

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
            `${process.env.REACT_APP_API_URL}/change-request/materials/${selectedRow.cr_cwo_id}`,
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
            `${process.env.REACT_APP_API_URL}/change-request/services/${selectedRow.cr_cwo_id}`,
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
        const statuses = [
          "Pending for approval X",
          "Pending for approval Y",
          "Approved",
          "Rejected",
        ];

        // Get change requests where the user is the approver or based on role
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/change-request/find`,
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
  }, [username, user.authToken, user.role, refreshKey]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=CRCWO`,
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
        setApprovers(approverArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };
    fetchApprovers();
  }, [selectedRow]);

  console.log(approvers);

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
        `${process.env.REACT_APP_API_URL}/change-request/update-status/${selectedRow.cr_cwo_id}`,
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
      // Determine if this is the first or second approver
      const isPendingForX = selectedRow.cr_status === "Pending for approval X";
      const isPendingForY = selectedRow.cr_status === "Pending for approval Y";
      const isFirstApprover = isPendingForX;

      // Prepare request data
      const requestData = {
        cr_status: "Approved",
        actioned_by: actionedBy,
        actioned_at: actionedAt,
        approver_comments: comment,
      };

      // If this is the first approver, include second approver information
      if (isFirstApprover) {
        if (!selectedApproverEmail || !approverName) {
          alert("Please select a second approver before approving.");
          return;
        }
        requestData.cr_approver2_email = selectedApproverEmail;
        requestData.cr_approver2_name = approverName;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/change-request/update-status/${selectedRow.cr_cwo_id}`,
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

  const columns = useMemo(() => [
    {
      accessorKey: "cr_cwo_id",
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
          {"CR-" + row.original.cr_cwo_id} {}{" "}
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
  ]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);

    const csvConfig = mkConfig({
      filename: `ChangeRequests_${username}`,
      useKeysAsHeaders: true,
    });

    const csv = generateCsv(csvConfig)(rowData);
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
      sorting: [
        {
          id: "cr_cwo_id", // Specify the column to sort by
          desc: true, // Sort in descending order
        },
      ],
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
      <CrModal
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

export default DashboardRequestsCR;
