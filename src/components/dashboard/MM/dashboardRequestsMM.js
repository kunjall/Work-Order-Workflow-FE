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
    setSelectedRow(row);
    setMmStatusPass(row ? row.mm_status : "");
    setOpen(true);
  };

  useEffect(() => {
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleProvidedQtyChange = (e, index) => {
    const input = e.target.value;

    setError(null);

    // Allow blank field
    if (input === "") {
      setMmMaterial((prev) =>
        prev.map((material, i) =>
          i === index ? { ...material, issued_qty: "" } : material
        )
      );
      return;
    }

    const floatValue = parseFloat(input);
    const roundedValue = Math.round(floatValue * 1000) / 1000;

    setMmMaterial((prev) =>
      prev.map((material, i) =>
        i === index ? { ...material, issued_qty: roundedValue } : material
      )
    );
  };

  useEffect(() => {
    if (selectedRow !== null) {
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

          const MmMaterialArray = response.data
            .filter((material) => material.material_req_qty > 0) // Only include materials with qty > 0
            .map((material) => ({
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
              issued_qty: material.material_provided_qty,
            }));

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
    }
  }, [locatorStock]);

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
            `${process.env.REACT_APP_API_URL}/mm/find-mm-actions?user=${user.name}&mmstatus=${status}&role=${user.role}`,
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
      const fetchApprovers = async () => {
        try {
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
    if (mmStatusPass.toLowerCase() === "pending with deployment head") {
      mmStatus = "Rejected by deployment head";
    } else if (
      mmStatusPass.toLowerCase() === "pending with material incharge"
    ) {
      mmStatus = "Rejected by material incharge";
    } else if (mmStatusPass.toLowerCase() === "pending with material head") {
      mmStatus = "Rejected by material head";
    } else if (mmStatusPass.toLowerCase() === "waiting for acknowledgement") {
      mmStatus = "Not received";
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/mm/reject-mm`,
        {
          mm_id: selectedRow.mm_id,
          cwo_id: selectedRow.cwo_id,
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
      alert("MRS rejected successfully!");
    } catch (err) {
      console.error("Error rejecting work order:", err);
      alert("Failed to reject work order. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (
      mmStatusPass.toLowerCase() !== "pending with material head" &&
      mmStatusPass.toLowerCase() !== "waiting for acknowledgement" &&
      !selectedApproverEmail
    ) {
      window.alert("Please select all fields before proceeding.");
      return;
    }
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
    switch (mmStatusPass.toLowerCase()) {
      case "pending with deployment head":
        mmStatus = "Pending with material incharge";
        break;
      case "pending with material incharge":
        mmStatus = "Pending with material head";
        break;
      case "pending with material head":
        mmStatus = "Waiting for acknowledgement";
        break;
      case "waiting for acknowledgement":
        mmStatus = "Received";
        break;
      default:
        break;
    }

    const actionedBy = user.name || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata", // Correct time zone
    });

    // Prepare request object
    const requestData = {
      mm_id: selectedRow.mm_id,
      cwo_id: selectedRow.cwo_id,
      mm_status: mmStatus,
      actioned_at: actionedAt,
      actioned_by: actionedBy,
      approver_comments: comment,
      warehouse_id: selectedRow.warehouse_id,
      locator_name: selectedRow.locator_name,
      transaction_type: selectedRow.transaction_type,
    };

    // Only update relevant approvers
    if (mmStatusPass.toLowerCase() === "pending with deployment head") {
      requestData.mm_approver2_email = selectedApproverEmail;
      requestData.mm_approver2_name = approverName;
    }

    if (mmStatusPass.toLowerCase() === "pending with material incharge") {
      requestData.mm_approver3_email = selectedApproverEmail;
      requestData.mm_approver3_name = approverName;
    }

    // Only send mmMaterial when necessary
    if (
      mmStatusPass.toLowerCase() === "pending with material head" ||
      mmStatusPass.toLowerCase().includes("acknowledgement")
    ) {
      requestData.mmMaterial = mmMaterial || [];
    }

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
      alert("MRS approved successfully!");
    } catch (error) {
      console.error("Error in approving: ", error);
      setError("Failed to Approve");
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "mm_id",
      header: "MRS No.",
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
          {"MRS-" + row.original.mm_id} {}{" "}
        </span>
      ),
    },
    {
      accessorKey: "transaction_type",
      header: "Transaction Type",
      size: 200,
      filterFn: "contains",
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
      header: "MRS Status",
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
      accessorKey: "requested_by",
      header: "Created By",
      size: 150,
      filterFn: "contains",
    },
    {
      accessorKey: "requested_at",
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

    rows.forEach((mm) => {
      const materials = allMmMaterial.filter(
        (mat) => mat.mm_id === String(mm.mm_id)
      );

      if (materials.length > 0) {
        materials.forEach((mat) => {
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
      } else {
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
      sorting: [
        {
          id: "mm_id", // Specify the column to sort by
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
      {}
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
        username={user}
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
