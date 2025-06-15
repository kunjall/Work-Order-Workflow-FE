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
import InvoiceModal from "./invoiceModal";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AuthContext } from "../../../context/authContext";

const Example = ({ refreshKey }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedApproverEmail, setSelectedApproverEmail] = useState("");
  const [approverName, setApproverName] = useState("");
  const [expenseStatusPass, setExpenseStatusPass] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  let expenseStatus;

  const { user } = useContext(AuthContext);

  const username = useMemo(() => user.username, [user]);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setExpenseStatusPass(row ? row.expense_status : "");
    setOpen(true);
  };

  useEffect(() => {
    setComment("");
  }, [selectedRow]);

  const handleCloseModal = () => {
    setOpen(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInventoryData = async () => {
      setIsLoading(true);
      try {
        const statuses = ["Pending for approval", "Approved", "Rejected"];

        const promises = statuses.map((status) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/invoice/find-invoice-expenses?user=${user.name}&expenseStatus=${status}&role=${user.role}`,
            {
              headers: { Authorization: user.authToken },
            }
          )
        );

        const responses = await Promise.all(promises);

        if (isMounted) {
          const uniqueExpensesMap = new Map();
          responses.forEach((response) => {
            if (Array.isArray(response.data)) {
              response.data.forEach((expense) => {
                if (
                  expense.expense_id &&
                  !uniqueExpensesMap.has(expense.expense_id)
                ) {
                  uniqueExpensesMap.set(expense.expense_id, expense);
                }
              });
            }
          });

          // Convert Map values to array
          const uniqueExpenses = Array.from(uniqueExpensesMap.values());

          setTableData(uniqueExpenses);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load expenses");
          setIsLoading(false);
        }
        console.error("Error fetching expense data:", err);
      }
    };

    fetchInventoryData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=EXP`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        const reviewerArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          approver_email: reviewer.approver_email,
          city: reviewer.city,
          approver_name: reviewer.approver_name,
        }));
        setApprovers(reviewerArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };

    fetchApprovers();
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

    expenseStatus = "Rejected";

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/invoice/update-expense-status`,
        {
          expense_id: selectedRow.expense_id,
          expense_status: expenseStatus,
          actioned_at: actionedAt,
          actioned_by: actionedBy,
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

    expenseStatus = "Approved";
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/invoice/update-expense-status`,
        {
          expense_id: selectedRow.expense_id,
          expense_status: expenseStatus,
          actioned_at: actionedAt,
          actioned_by: actionedBy,
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
  };

  const columns = useMemo(() => [
    {
      accessorKey: "expense_id",
      header: "Expense Id",
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
          {"EXP-" + row.original.expense_id} {}{" "}
        </span>
      ),
    },
    {
      accessorKey: "mwo_id",
      header: "Mwo Id",
      width: "20px",
      size: 50,
      filterFn: "contains",
      Cell: ({ row }) => (
        <span>
          {"MWO-" + row.original.mwo_id} {}{" "}
        </span>
      ),
    },
    {
      accessorKey: "cwo_id",
      header: "Cwo Id",
      width: "20px",
      size: 50,
      filterFn: "contains",
      Cell: ({ row }) => (
        <span>
          {"CWO-" + row.original.cwo_id} {}{" "}
        </span>
      ),
    },
    {
      accessorKey: "service",
      header: "Activity",
      size: 200,
      filterFn: "contains",
    },
    {
      accessorKey: "vendor_name",
      header: "Vendor Name",
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
      accessorKey: "expense_amount",
      header: "Amount",
      size: 200,
      filterFn: "contains",
    },

    {
      accessorKey: "expense_status",
      header: "Expense Status",
      size: 200,
      filterFn: "contains",
    },
  ]);

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
          id: "inventory_id", // Specify the column to sort by
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
        }}
      ></Box>

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
      <InvoiceModal
        open={open}
        onClose={handleCloseModal}
        rowData={selectedRow}
        setComment={setComment}
        comment={comment}
        handleApprove={handleApprove}
        approvers={approvers}
        setSelectedApproverEmail={setSelectedApproverEmail}
        setApproverName={setApproverName}
        invoiceStatus={expenseStatusPass}
        handleReject={handleReject}
        username={user}
      />
    </Box>
  );
};

export default Example;
