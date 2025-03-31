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
    setSelectedRow(row);
    setMbStatusPass(row ? row.mb_status : "");
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
      const fetchApprovers = async () => {
        try {
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
        setAllMbService(mbServiceArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setError("Failed to load inventory materials");
      }
    };
    fetchAllMbService();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMbData = async () => {
      setIsLoading(true);
      try {
        const statuses = [
          "Pending with deployment head",
          "Pending with material head",
          "Pending with billing spoc",
          "Approved",
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
    if (mbStatusPass.toLowerCase() === "pending with deployment head") {
      mbStatus = "Rejected by deployment head";
    } else if (mbStatusPass.toLowerCase() === "pending with material head") {
      mbStatus = "Rejected by material head";
    } else if (mbStatusPass.toLowerCase() === "pending with billing spoc") {
      mbStatus = "Rejected";
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/mb/reject-mb`,
        {
          mb_id: selectedRow.mb_id,
          cwo_id: selectedRow.cwo_id,
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
      alert("MB rejected successfully!");
    } catch (err) {
      console.error("Error rejecting work order:", err);
      alert("Failed to reject work order. Please try again.");
    }
  };

  const handleApprove = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
    if (mbStatusPass.toLowerCase() === "pending with deployment head") {
      mbStatus = "Pending with material head";
    } else if (mbStatusPass.toLowerCase() === "pending with material head") {
      mbStatus = "Pending with billing spoc";
    } else if (mbStatusPass.toLowerCase() === "pending with billing spoc") {
      mbStatus = "Approved";
    }
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

    const requestData = {
      mb_id: selectedRow.mb_id,
      cwo_id: selectedRow.cwo_id,
      mb_status: mbStatus,

      mb_approver2_email:
        selectedApproverEmail || selectedRow.mb_approver2_email || "",
      mb_approver2_name: approverName || selectedRow.mb_approver2_name || "",

      mb_approver3_email:
        mbStatusPass.toLowerCase() === "pending with deployment head"
          ? selectedApproverEmail || selectedRow.mb_approver3_email || ""
          : selectedRow.mb_approver3_email || "",
      mb_approver3_name:
        mbStatusPass.toLowerCase() === "pending with deployment head"
          ? approverName || selectedRow.mb_approver3_name || ""
          : selectedRow.mb_approver3_name || "",

      mb_approver4_email:
        mbStatusPass.toLowerCase() === "pending with material head"
          ? selectedApproverEmail || selectedRow.mb_approver4_email || ""
          : selectedRow.mb_approver4_email || "",
      mb_approver4_name:
        mbStatusPass.toLowerCase() === "pending with material head"
          ? approverName || selectedRow.mb_approver4_name || ""
          : selectedRow.mb_approver4_name || "",

      actioned_at: actionedAt,
      actioned_by: actionedBy,
      approver_comments: comment,

      locator_name: selectedRow.locator_name,

      mbMaterial:
        mbStatusPass.toLowerCase() === "pending with billing spoc"
          ? mbMaterial || []
          : undefined,
      mbService:
        mbStatusPass.toLowerCase() === "pending with billing spoc"
          ? mbService || []
          : undefined,
    };

    if (requestData.mbMaterial === undefined) {
      delete requestData.mbMaterial;
    }

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
      alert("MB approved successfully!");
    } catch (error) {
      console.error("Error in approving: ", error);
      setError("Failed to Approve");
    }
  };

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
          onClick={() => handleOpenModal(row.original)}
        >
          {"MB-" + row.original.mb_id} {}{" "}
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
      accessorKey: "customer_name",
      header: "Customer Name",
      filterFn: "contains",
      size: 250,
    },
    {
      accessorKey: "route_name",
      header: "Route Name",
      filterFn: "contains",
      size: 250,
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
      Cell: ({ cell }) => cell.getValue(),
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
  ]);

  const handleExportRows = (rows) => {
    const flattened = [];

    rows.forEach((mb) => {
      const materials = allMbMaterial.filter(
        (mat) => mat.mb_id === String(mb.mb_id)
      );

      const services = allMbService.filter(
        (srv) => srv.mb_id === String(mb.mb_id)
      );

      if (materials.length > 0 || services.length > 0) {
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
