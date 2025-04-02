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
import CwoModal from "./cwoModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const { user } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = useMemo(() => user.username, []);
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
    setSelectedRow(row);
    setCwoStatusPass(row ? row.cwo_status : "");
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
      const fetchCwoMaterial = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-material?cwo_id=${selectedRow.cwo_id}`,
            {
              headers: {
                Authorization: user.authToken,
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
                Authorization: user.authToken,
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
            service_price: service.service_price,
          }));
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
              Authorization: user.authToken,
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
        setAllChildMaterial(childMaterialArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setAllChildMaterial([]);
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
              Authorization: user.authToken,
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
        setAllChildService(childServiceArray);
      } catch (err) {
        console.error("Error fetching inventory materials:", err);
        setAllChildService([]);
      }
    };
    fetchAllChildService();
  }, []);

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
            `${process.env.REACT_APP_API_URL}/workorder/find-child-workorder-actions?user=${user.name}&cwostatus=${status}&role=${user.role}`,
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

    fetchCwoData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  useEffect(() => {
    if (selectedRow != null && selectedRow.warehouse_city != null) {
      const fetchApprovers = async () => {
        try {
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
    cwoStatus = "Rejected by approver";
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
            Authorization: user.authToken,
          },
        }
      );
      alert("Work order rejected successfully!");
    } catch (err) {
      console.error("Error rejecting work order:", err);
      alert("Failed to reject work order. Please try again.");
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
    cwoStatus = "Approved";
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/workorder/update-cwo-approve-status`,
        {
          cwo_id: selectedRow.cwo_id,
          cwo_status: cwoStatus,
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
      alert("Work order approved successfully!");
    } catch (error) {
      console.error("Error in approving: ", error);
      setError("Failed to Approve");
    }
  };

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
          onClick={() => handleOpenModal(row.original)}
        >
          {"CWO-" + row.original.cwo_id} {}{" "}
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
      accessorKey: "route_name",
      header: "Route Name",
      size: 150,
      Cell: ({ cell }) => cell.getValue(),
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

    rows.forEach((cwo) => {
      const materials = allChildMaterial.filter(
        (mat) => mat.cwo_id === String(cwo.cwo_id)
      );

      const services = allChildService.filter(
        (srv) => srv.cwo_id === String(cwo.cwo_id)
      );

      if (materials.length > 0 || services.length > 0) {
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
        username={user}
      />
    </Box>
  );
};

export default Example;
