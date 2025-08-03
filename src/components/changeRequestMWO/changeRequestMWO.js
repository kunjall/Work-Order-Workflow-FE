import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Radio,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Checkbox,
  IconButton,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
} from "@mui/material";

const ChangeRequestMWO = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [approverName, setApproverName] = useState("");
  const [workorders, setWorkorders] = useState([]);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [exists, setExists] = useState(false);
  const [existsMessage, setExistsMessage] = useState(
    "Please process prior change requests before creating a new one"
  );
  const [materialLineItems, setMaterialLineItems] = useState([]);
  const [serviceLineItems, setServiceLineItems] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [newMaterialQty, setNewMaterialQty] = useState("");
  const [newServiceQty, setNewServiceQty] = useState("");
  const [materialError, setMaterialError] = useState("");
  const [serviceError, setServiceError] = useState("");

  // New state variables for arrays
  const [crMwoMaterials, setCrMwoMaterials] = useState([]);
  const [crMwoServices, setCrMwoServices] = useState([]);

  // Fetch all materials and services for adding new items
  useEffect(() => {
    const fetchAllMaterials = async () => {
      if (!formData.customer_name) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-material?company=${formData.customer_name}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        console.log("Materials fetched:", response.data);
        setAllMaterials(response.data);
      } catch (err) {
        console.error("Failed to fetch materials:", err);
        setError("Failed to load materials");
      }
    };

    const fetchAllServices = async () => {
      if (!formData.customer_name) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-service?company=${formData.customer_name}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        console.log("Services fetched:", response.data);
        setAllServices(response.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Failed to load services");
      }
    };

    fetchAllMaterials();
    fetchAllServices();
  }, [formData.customer_name, user.authToken]);

  const totalMaterialAmount = Array.isArray(materialLineItems)
    ? materialLineItems.reduce(
        (acc, item) => acc + Number(item.material_price || 0),
        0
      )
    : 0;

  const totalServiceAmount = Array.isArray(serviceLineItems)
    ? serviceLineItems.reduce(
        (acc, item) => acc + Number(item.service_price || 0),
        0
      )
    : 0;

  const handleSubmit = async () => {
    if (!selectedApproverEmail || !selectedWorkOrder) {
      window.alert("Please select all required fields before proceeding.");
      return;
    }
    const isConfirmed = window.confirm(
      "Are you sure you want to submit this change request?"
    );

    if (!isConfirmed) {
      return;
    }

    const createdBy = user.name || "unknown";
    const createdAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });

    // Calculate total costs
    const totalServiceCost = Array.isArray(serviceLineItems)
      ? serviceLineItems.reduce((total, service) => {
          // Use cr_amount if available, otherwise use the original amount
          const serviceAmount = service.is_removed
            ? 0
            : crMwoServices.find((s) => s.service_id === service.service_id)
                ?.service_cr_price ||
              service.service_price ||
              (
                Number(service.service_wo_qty) * Number(service.service_rate)
              ).toFixed(2);

          return total + Number(serviceAmount);
        }, 0)
      : 0;

    const totalMaterialCost = Array.isArray(materialLineItems)
      ? materialLineItems.reduce((total, material) => {
          // Use cr_amount if available, otherwise use the original amount
          const materialAmount = material.is_removed
            ? 0
            : crMwoMaterials.find((m) => m.material_id === material.material_id)
                ?.material_cr_price ||
              material.material_price ||
              (
                Number(material.material_wo_qty) *
                Number(material.material_rate)
              ).toFixed(2);

          return total + Number(materialAmount);
        }, 0)
      : 0;

    // Prepare materials data with correct field mappings
    const mappedMaterials = Array.isArray(crMwoMaterials)
      ? crMwoMaterials.map((material) => {
          // Log each material to debug
          console.log("Material being mapped:", material);

          return {
            record_id: `${formData.mwo_number}-${
              material.material_id
            }-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            mwo_id: formData.mwo_id,
            mwo_number: formData.mwo_number,
            cr_id: null, // Will be set by backend
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_unit_price: material.price || material.material_rate,
            material_uom: material.uom || material.material_uom,
            material_cr_qty: material.cr_qty,
            material_old_qty: material.old_qty,
            is_removed: material.is_removed || false,
            is_added: material.is_added || false,
            old_amount:
              material.amount ||
              (
                Number(material.old_qty) *
                Number(material.price || material.material_rate)
              ).toFixed(2),
            cr_amount:
              material.material_cr_price ||
              material.amount ||
              (
                Number(material.cr_qty) *
                Number(material.price || material.material_rate)
              ).toFixed(2),
          };
        })
      : [];

    // Log the final mapped materials to verify is_added flag
    console.log(
      "Final mapped materials:",
      mappedMaterials.map((m) => ({
        material_id: m.material_id,
        is_added: m.is_added,
      }))
    );

    // Prepare services data with correct field mappings
    const mappedServices = Array.isArray(crMwoServices)
      ? crMwoServices.map((service) => {
          // Log each service to debug
          console.log("Service being mapped:", service);

          return {
            record_id: `${formData.mwo_number}-${
              service.service_id
            }-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            mwo_id: formData.mwo_id,
            mwo_number: formData.mwo_number,
            cr_id: null,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_unit_price: service.price || service.service_rate,
            service_uom: service.uom || service.service_uom,
            service_cr_qty: service.cr_qty,
            service_old_qty: service.old_qty,
            is_removed: service.is_removed || false,
            is_added: service.is_added || false,
            old_amount:
              service.amount ||
              (
                Number(service.old_qty) *
                Number(service.price || service.service_rate)
              ).toFixed(2),
            cr_amount:
              service.service_cr_price ||
              service.amount ||
              (
                Number(service.cr_qty) *
                Number(service.price || service.service_rate)
              ).toFixed(2),
          };
        })
      : [];

    // Log the final mapped services to verify is_added flag
    console.log(
      "Final mapped services:",
      mappedServices.map((s) => ({
        service_id: s.service_id,
        is_added: s.is_added,
      }))
    );

    const requestData = {
      mwo_number: formData.mwo_number,
      total_service_cost: totalServiceCost.toFixed(2),
      total_material_cost: totalMaterialCost.toFixed(2),
      cr_status: "Pending for approval deployment head",
      customer_name: formData.customer_name,
      cr_approver_email: selectedApproverEmail,
      cr_approver_name: approverName,
      created_by: createdBy,
      created_at: createdAt,
      mwo_id: formData.mwo_id,
      materialItems: mappedMaterials,
      serviceItems: mappedServices,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/change-request/mwo/create`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      if (response.status === 201) {
        alert(`Change Request submitted successfully`);
        resetForm();
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        setError("An error occurred while submitting the change request.");
      }
    }
  };

  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        console.log("Checking for CR requests for MWO:", formData.mwo_number);

        // Check for any MB requests
        let mbResponse;
        try {
          mbResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/mb/find-mb-by-mwo`,
            {
              params: {
                mwo_number: formData.mwo_number,
              },
              headers: {
                Authorization: user.authToken,
              },
            }
          );
          console.log("MB Response:", mbResponse.data);
        } catch (mbError) {
          console.error("Error fetching MB data:", mbError);
          mbResponse = { data: [] }; // Default to empty array if endpoint fails
        }

        // Check for any MM requests
        let mmResponse;
        try {
          mmResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/mm/find-mm-by-mwo`,
            {
              params: {
                mwo_number: formData.mwo_number,
              },
              headers: {
                Authorization: user.authToken,
              },
            }
          );
          console.log("MM Response:", mmResponse.data);
        } catch (mmError) {
          console.error("Error fetching MM data:", mmError);
          mmResponse = { data: [] }; // Default to empty array if endpoint fails
        }

        // Check for existing change requests that are not approved
        let crResponse;
        try {
          crResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/change-request/mwo/find`,
            {
              params: {
                mwo_number: formData.mwo_number,
              },
              headers: {
                Authorization: user.authToken,
              },
            }
          );
          console.log("CR Response:", crResponse.data);
        } catch (crError) {
          console.error("Error fetching CR data:", crError);
          crResponse = { data: { data: [] } }; // Default to empty array if endpoint fails
        }

        // Check for pending MB requests (status is not "Approved")
        const pendingMbExists =
          mbResponse.data &&
          Array.isArray(mbResponse.data) &&
          mbResponse.data.some((mb) => mb.mb_status !== "Approved");

        // Check for pending MM requests (status is not "Approved")
        const pendingMmExists =
          mmResponse.data &&
          Array.isArray(mmResponse.data) &&
          mmResponse.data.some((mm) => mm.mm_status !== "Approved");

        console.log(crResponse.data.data);

        // Check if there's an existing CR that's not approved
        const pendingCrExists =
          crResponse.data &&
          Array.isArray(crResponse.data.data) &&
          crResponse.data.data.some((cr) => {
            const status = cr.cr_status?.toLowerCase();
            return status !== "approved" && !status.includes("rejected");
          });

        console.log(
          "Pending MB exists:",
          pendingMbExists,
          "Pending MM exists:",
          pendingMmExists,
          "Pending CR exists:",
          pendingCrExists
        );

        // Check for associated CWOs and their quantities
        let cwosResponse;
        let cwoMaterialsMap = {};
        let cwoServicesMap = {};
        let cwoQuantitiesHigher = false;
        let cwoQuantityMessage = "";

        try {
          // Fetch all CWOs associated with this MWO
          cwosResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-workorder-by-mwo`,
            {
              params: {
                mwo_number: formData.mwo_number,
              },
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          const cwos = cwosResponse.data;
          console.log("Associated CWOs:", cwos);

          if (cwos && cwos.length > 0) {
            // For each CWO, fetch materials and services
            for (const cwo of cwos) {
              // Fetch CWO materials
              const cwoMaterialsResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/workorder/find-child-material`,
                {
                  params: { cwo_id: cwo.cwo_id },
                  headers: { Authorization: user.authToken },
                }
              );

              // Fetch CWO services
              const cwoServicesResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/workorder/find-child-services`,
                {
                  params: {
                    cwo_number: cwo.cwo_number,
                    cwo_id: cwo.cwo_id,
                  },
                  headers: { Authorization: user.authToken },
                }
              );

              // Process materials
              const cwoMaterials = cwoMaterialsResponse.data;
              if (cwoMaterials && cwoMaterials.length > 0) {
                cwoMaterials.forEach((material) => {
                  if (!cwoMaterialsMap[material.material_id]) {
                    cwoMaterialsMap[material.material_id] = 0;
                  }
                  cwoMaterialsMap[material.material_id] += Number(
                    material.material_wo_qty || 0
                  );
                });
              }

              // Process services
              const cwoServices = cwoServicesResponse.data;
              if (cwoServices && cwoServices.length > 0) {
                cwoServices.forEach((service) => {
                  if (!cwoServicesMap[service.service_id]) {
                    cwoServicesMap[service.service_id] = 0;
                  }
                  cwoServicesMap[service.service_id] += Number(
                    service.service_wo_qty || 0
                  );
                });
              }
            }

            // Compare CWO quantities with MWO quantities
            if (materialLineItems && materialLineItems.length > 0) {
              for (const material of materialLineItems) {
                const cwoQty = cwoMaterialsMap[material.material_id] || 0;
                const mwoQty = Number(material.material_wo_qty || 0);

                if (cwoQty > mwoQty) {
                  cwoQuantitiesHigher = true;
                  cwoQuantityMessage += `Material ${material.material_id}: MWO qty=${mwoQty}, Total CWO qty=${cwoQty}\n`;
                }
              }
            }

            if (serviceLineItems && serviceLineItems.length > 0) {
              for (const service of serviceLineItems) {
                const cwoQty = cwoServicesMap[service.service_id] || 0;
                const mwoQty = Number(service.service_wo_qty || 0);

                if (cwoQty > mwoQty) {
                  cwoQuantitiesHigher = true;
                  cwoQuantityMessage += `Service ${service.service_id}: MWO qty=${mwoQty}, Total CWO qty=${cwoQty}\n`;
                }
              }
            }
          }
        } catch (cwoError) {
          console.error("Error fetching CWO data:", cwoError);
        }

        // Show popup if pending MB, MM, CR exists or CWO quantities are higher
        if (
          pendingMbExists ||
          pendingMmExists ||
          pendingCrExists ||
          cwoQuantitiesHigher
        ) {
          console.log("Showing popup and resetting form");

          if (pendingCrExists) {
            setExistsMessage(
              "A pending change request already exists for this MWO. Please wait for it to be processed."
            );
          } else if (pendingMbExists) {
            setExistsMessage(
              "Please process pending MB requests before creating a change request."
            );
          } else if (pendingMmExists) {
            setExistsMessage(
              "Please process pending MM requests before creating a change request."
            );
          } else if (cwoQuantitiesHigher) {
            setExistsMessage(
              "Warning: Some CWOs have higher quantities than the MWO:\n" +
                cwoQuantityMessage +
                "\nThis may indicate that the CWOs are already filled for higher quantities than the MWO. Do you still want to proceed?"
            );
          }

          setExists(true);

          if (pendingCrExists || pendingMbExists || pendingMmExists) {
            setSelectedWorkOrder(null);
            setFormData({});
          }
        }
      } catch (error) {
        console.error("Error checking pending requests:", error);
      }
    };

    if (formData.mwo_number) checkPendingRequests();
  }, [
    formData.mwo_number,
    user.authToken,
    materialLineItems,
    serviceLineItems,
  ]);

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
        const reviewerArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          reviewer_email: reviewer.approver_email,
          city: reviewer.city,
          reviewer_name: reviewer.approver_name,
        }));
        setApprovers(reviewerArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };

    if (formData.execution_city) fetchApprovers();
  }, [formData.execution_city, selectedWorkOrder, user.authToken]);

  useEffect(() => {
    if (selectedApproverEmail) {
      const selectedReviewer = approvers.find(
        (reviewer) => reviewer.reviewer_email === selectedApproverEmail
      );
      setApproverName(selectedReviewer ? selectedReviewer.reviewer_name : "");
    } else {
      setApproverName("");
    }
  }, [selectedApproverEmail, approvers]);

  // This effect only runs when materialLineItems changes due to loading a new work order
  // It preserves any edits made to existing items
  useEffect(() => {
    const processMaterialItems = () => {
      if (materialLineItems.length > 0) {
        // Create a map of existing edited materials by ID for quick lookup
        const existingMaterialsMap = {};
        crMwoMaterials.forEach((material) => {
          if (material.material_id) {
            existingMaterialsMap[material.material_id] = material;
          }
        });

        // Create new materials array, preserving edits for existing items
        const materials = materialLineItems.map((material) => {
          const existingMaterial = existingMaterialsMap[material.material_id];

          // If this material already exists in crMwoMaterials, preserve its edited values
          if (existingMaterial) {
            return {
              ...existingMaterial,
              // Update only these fields from the material line item
              record_id: `${formData.mwo_number}-${
                material.material_id
              }-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              material_desc: material.material_desc,
              uom: material.material_uom,
              mwo_id: formData.mwo_id,
              price: material.material_rate,
              material_wo_qty: material.material_wo_qty,
              // Keep the edited values
              cr_qty: existingMaterial.cr_qty,
              material_cr_price: existingMaterial.material_cr_price,
              is_removed:
                material.is_removed || existingMaterial.is_removed || false,
            };
          }

          // Otherwise create a new entry
          return {
            record_id: `${formData.mwo_number}-${material.material_id}`,
            material_id: material.material_id,
            material_desc: material.material_desc,
            uom: material.material_uom,
            mwo_id: formData.mwo_id,
            price: material.material_rate,
            cr_qty: material.material_wo_qty, // Default to original quantity if not modified
            old_qty: material.material_wo_qty, // Store the original quantity
            material_wo_qty: material.material_wo_qty, // Store the original work order quantity
            amount: material.material_price, // Use price if available
            is_removed: material.is_removed || false,
          };
        });

        // Only update state if we're loading a new work order or if crMwoMaterials is empty
        if (crMwoMaterials.length === 0 || selectedWorkOrder !== null) {
          setCrMwoMaterials(materials);
        }
      }
    };

    processMaterialItems();
  }, [
    materialLineItems,
    formData.mwo_number,
    formData.mwo_id,
    selectedWorkOrder,
  ]);

  // This effect only runs when serviceLineItems changes due to loading a new work order
  // It preserves any edits made to existing items
  useEffect(() => {
    const processServiceItems = () => {
      if (serviceLineItems.length > 0) {
        // Create a map of existing edited services by ID for quick lookup
        const existingServicesMap = {};
        crMwoServices.forEach((service) => {
          if (service.service_id) {
            existingServicesMap[service.service_id] = service;
          }
        });

        // Create new services array, preserving edits for existing items
        const services = serviceLineItems.map((service) => {
          const existingService = existingServicesMap[service.service_id];

          // If this service already exists in crMwoServices, preserve its edited values
          if (existingService) {
            return {
              ...existingService,
              // Update only these fields from the service line item
              record_id: `${formData.mwo_number}-${service.service_id}`,
              service_desc: service.service_desc,
              uom: service.service_uom,
              mwo_id: formData.mwo_id,
              price: service.service_rate,
              service_wo_qty: service.service_wo_qty,
              // Keep the edited values
              cr_qty: existingService.cr_qty,
              service_cr_price: existingService.service_cr_price,
              is_removed:
                service.is_removed || existingService.is_removed || false,
            };
          }

          // Otherwise create a new entry
          return {
            record_id: `${formData.mwo_number}-${service.service_id}`,
            mwo_id: formData.mwo_id,
            service_id: service.service_id,
            service_desc: service.service_desc,
            uom: service.service_uom,
            price: service.service_rate,
            cr_qty: service.service_wo_qty, // Default to original quantity if not modified
            old_qty: service.service_wo_qty, // Store the original quantity
            service_wo_qty: service.service_wo_qty, // Store the original work order quantity
            amount: service.service_price,
            is_removed: service.is_removed || false,
          };
        });

        // Only update state if we're loading a new work order or if crMwoServices is empty
        if (crMwoServices.length === 0 || selectedWorkOrder !== null) {
          setCrMwoServices(services);
        }
      }
    };

    processServiceItems();
  }, [
    serviceLineItems,
    formData.mwo_id,
    formData.mwo_number,
    selectedWorkOrder,
  ]);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-workorder`,
          {
            params: {
              company: user.company,
            },
            headers: { Authorization: user.authToken },
          }
        );

        const data = response.data;

        setWorkorders(data);
      } catch (err) {
        console.error("Failed to fetch work orders:", err);
        setError("Failed to load work orders");
      }
    };

    fetchWorkOrders();
  }, [user]);

  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchMotherServices = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-services`,
            {
              params: {
                mwo_id: selectedWorkOrder.mwo_id,
              },
              headers: { Authorization: user.authToken },
            }
          );
          setServiceLineItems(response.data);
        } catch (err) {
          console.error("Failed to fetch mother services:", err);
          setError("Failed to load mother services");
        }
      };

      const fetchMotherMaterials = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-material`,
            {
              params: { mwo_id: selectedWorkOrder.mwo_id },
              headers: { Authorization: user.authToken },
            }
          );
          setMaterialLineItems(response.data);
        } catch (err) {
          console.error("Failed to fetch mother materials:", err);
          setError("Failed to load mother materials");
        }
      };

      fetchMotherServices();
      fetchMotherMaterials();
    }
  }, [selectedWorkOrder, user.authToken]);

  const resetForm = () => {
    setSelectedWorkOrder(null);
    setFormData({});
    setMaterialLineItems([]);
    setServiceLineItems([]);
    setApprovers([]);
    setSelectedApproverEmail([]);
    setApproverName("");
    setCrMwoMaterials([]);
    setCrMwoServices([]);
    setSelectedMaterialId("");
    setSelectedServiceId("");
    setNewMaterialQty("");
    setNewServiceQty("");
  };

  const handleWorkOrderSelect = (event, newValue) => {
    if (newValue) {
      setSelectedWorkOrder(newValue);
      setFormData({
        mwo_id: newValue.mwo_id || "",
        mwo_number: newValue.mwo_number || "",
        execution_city: newValue.execution_city || "",
        workorder_type: newValue.workorder_type || "",
        total_material_cost: newValue.total_material_cost || "",
        total_service_cost: newValue.total_service_cost || "",
        mwo_status: newValue.mwo_status || "",
        customer_name: newValue.customer_name || "",
        mwo_approver_email: newValue.mwo_approver_email || "",
        mwo_approver_name: newValue.mwo_approver_name || "",
        approved_by: newValue.approved_by || "",
        approved_at: newValue.approved_at || "",
        approver_comments: newValue.approver_comments || "",
        created_by: newValue.created_by || "",
        created_at: newValue.created_at || "",
        state: newValue.state || "",
        route_name: newValue.route_name || "",
        gis_code: newValue.gis_code || "",
        homepass_count: newValue.homepass_count || "",
        activity: newValue.activity || "",
      });
    } else {
      setSelectedWorkOrder(null);
      setFormData({});
      setMaterialLineItems([]);
      setServiceLineItems([]);
      setApprovers([]);
      setSelectedApproverEmail([]);
      setApproverName("");
      setCrMwoMaterials([]);
      setCrMwoServices([]);
      setSelectedMaterialId("");
      setSelectedServiceId("");
      setNewMaterialQty("");
      setNewServiceQty("");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Handle adding a new material from material master
  const handleAddMaterial = () => {
    if (!selectedMaterialId || !selectedWorkOrder || !newMaterialQty) return;

    const selectedMaterial = allMaterials.find(
      (material) => material.item_id === selectedMaterialId
    );

    if (!selectedMaterial) return;

    // Check if this material already exists in the list
    const materialExists =
      Array.isArray(materialLineItems) &&
      materialLineItems.some(
        (material) => material.material_id === selectedMaterial.item_id
      );

    if (materialExists) {
      setMaterialError("This material already exists");
      return;
    }

    // Clear any previous error
    setMaterialError("");

    const qty = Number(newMaterialQty);
    const rate = Number(selectedMaterial.material_rate || 0);
    const price = (qty * rate).toFixed(2);

    // Create a new material entry
    const newMaterial = {
      record_id: `${formData.mwo_number}-${selectedMaterial.item_id}`,
      material_id: selectedMaterial.item_id,
      material_desc: selectedMaterial.item_name,
      material_uom: selectedMaterial.item_uom,
      material_rate: selectedMaterial.item_rate,
      material_wo_qty: "0", // Default to 0 for new materials
      material_price: price,
    };

    // Add to materialLineItems - ensure prev is an array
    setMaterialLineItems((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      newMaterial,
    ]);

    // Add to crMwoMaterials - ensure prev is an array
    setCrMwoMaterials((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        ...newMaterial,
        cr_qty: newMaterialQty,
        old_qty: "0", // Default to 0 for new materials
        is_added: true, // Mark as added
        price: selectedMaterial.material_rate,
        uom: selectedMaterial.material_uom,
        material_cr_price: price,
      },
    ]);

    // Reset selection
    setSelectedMaterialId("");
    setNewMaterialQty("");
  };

  // Handle adding a new service from service master
  const handleAddService = () => {
    if (!selectedServiceId || !selectedWorkOrder || !newServiceQty) return;

    const selectedService = allServices.find(
      (service) => service.service_id === selectedServiceId
    );

    if (!selectedService) return;

    // Check if this service already exists in the list
    const serviceExists =
      Array.isArray(serviceLineItems) &&
      serviceLineItems.some(
        (service) => service.service_id === selectedService.service_id
      );

    if (serviceExists) {
      setServiceError("This service already exists");
      return;
    }

    // Clear any previous error
    setServiceError("");

    const qty = Number(newServiceQty);
    const rate = Number(selectedService.service_rate || 0);
    const price = (qty * rate).toFixed(2);

    // Create a new service entry
    const newService = {
      record_id: `${formData.mwo_number}-${selectedService.service_id}`,
      service_id: selectedService.service_id,
      service_desc: selectedService.service_desc,
      service_uom: selectedService.service_uom,
      service_rate: selectedService.service_rate,
      service_wo_qty: "0", // Default to 0 for new services
      service_price: price,
    };

    // Add to serviceLineItems - ensure prev is an array
    setServiceLineItems((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      newService,
    ]);

    // Add to crMwoServices - ensure prev is an array
    setCrMwoServices((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        ...newService,
        cr_qty: newServiceQty,
        old_qty: "0", // Default to 0 for new services
        is_added: true, // Mark as added
        price: selectedService.service_rate,
        uom: selectedService.service_uom,
        service_cr_price: price,
      },
    ]);

    // Reset selection
    setSelectedServiceId("");
    setNewServiceQty("");
  };

  let theme = createTheme({
    palette: {
      primary: {
        main: "#ec7c30",
      },
      secondary: {
        main: "#2c3e50",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 4,
            padding: "4px 12px",
            boxShadow: "none",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
      },
      MuiAutocomplete: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.8rem",
            transform: "translate(14px, 8px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -6px) scale(0.75)",
            },
          },
        },
      },
    },
  });
  theme = responsiveFontSizes(theme);

  console.log(crMwoMaterials);
  console.log(crMwoServices);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ overflowX: "hidden", padding: 2 }}>
        {/* Heading */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#2c3e50",
              mb: 0.5,
            }}
          >
            Change Request - MWO
          </Typography>
        </Box>
        {exists ? (
          <Dialog open={exists}>
            <DialogTitle>{existsMessage}</DialogTitle>
            <DialogActions>
              {existsMessage.includes(
                "Warning: Some CWOs have higher quantities"
              ) ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setExists(false);
                      // Continue with the form, don't reset
                    }}
                  >
                    Proceed Anyway
                  </Button>
                  <Button
                    onClick={() => {
                      setExists(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setExists(false);
                    resetForm();
                  }}
                >
                  Close
                </Button>
              )}
            </DialogActions>
          </Dialog>
        ) : (
          <div>
            <div>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Grid
                    container
                    spacing={0.5}
                    sx={{
                      maxWidth: "100%",
                    }}
                  >
                    {error ? (
                      <Typography color="error">{error}</Typography>
                    ) : (
                      <>
                        <Grid item xs={12} sm={6} md={2}>
                          <Autocomplete
                            value={selectedWorkOrder}
                            options={[...workorders].sort(
                              (a, b) =>
                                b.mwo_id
                                  ?.toString()
                                  .localeCompare(a.mwo_id?.toString() || "") ||
                                0
                            )}
                            getOptionLabel={(option) =>
                              String(option.mwo_id) || ""
                            }
                            onChange={(event, newValue) => {
                              handleWorkOrderSelect(event, newValue);
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.mwo_number === value?.mwo_number
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="MWO Id"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Route Name"
                            value={formData.route_name || ""}
                            InputProps={{ readOnly: true }}
                            disabled
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={7}>
                          <TextField
                            label="MWO Number"
                            value={formData.mwo_number || ""}
                            InputProps={{ readOnly: true }}
                            disabled
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Execution City"
                            value={formData.execution_city || ""}
                            InputProps={{ readOnly: true }}
                            disabled
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Execution State"
                            value={formData.state || ""}
                            InputProps={{ readOnly: true }}
                            disabled
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Autocomplete
                            value={
                              selectedApproverEmail && approvers.length > 0
                                ? approvers.find(
                                    (approver) =>
                                      approver.reviewer_email ===
                                      selectedApproverEmail
                                  ) || null
                                : null
                            }
                            options={[...approvers].sort(
                              (a, b) =>
                                b.reviewer_name?.localeCompare(
                                  a.reviewer_name || ""
                                ) || 0
                            )}
                            getOptionLabel={(option) =>
                              option.reviewer_email.toString() || ""
                            }
                            onChange={(event, newValue) => {
                              setSelectedApproverEmail(
                                newValue ? newValue.reviewer_email : null
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Approver"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="approver-name"
                            label="Approver Name"
                            value={approverName}
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                              style: {
                                color: "#dc004e",
                                fontWeight: "bold",
                              },
                            }}
                            fullWidth
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Services Section */}
              <Card
                sx={{
                  p: "4px 8px",
                  mb: 0.5,
                  borderRadius: "4px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 0.25,
                    color: "blue",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Services
                </Typography>
                <CardContent>
                  <Grid container spacing={0.5} mt={0.5}>
                    {Array.isArray(serviceLineItems) &&
                      serviceLineItems.map((service, index) => (
                        <React.Fragment key={service.record_id || index}>
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              label="Service Code"
                              value={service.service_id || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              label="Description"
                              value={service.service_desc || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              label="UOM"
                              value={service.service_uom || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Original Quantity */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              disabled
                              label="Original Qty"
                              value={
                                crMwoServices[index]?.old_qty !== undefined
                                  ? crMwoServices[index].old_qty
                                  : service.service_wo_qty || ""
                              }
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Make CWO QTY editable */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              label="New Qty"
                              type="number"
                              inputProps={{ min: 0 }}
                              value={
                                crMwoServices[index]?.cr_qty !== undefined
                                  ? crMwoServices[index].cr_qty
                                  : service.service_wo_qty || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const crQty = Number(value);

                                setCrMwoServices((prevItems) =>
                                  prevItems.map((item, idx) =>
                                    idx === index
                                      ? {
                                          ...item,
                                          cr_qty: value,
                                          service_cr_price:
                                            value !== ""
                                              ? (
                                                  crQty *
                                                  Number(service.service_rate)
                                                ).toFixed(2)
                                              : "",
                                        }
                                      : item
                                  )
                                );
                              }}
                              onKeyDown={(e) => {
                                if (["e", "E", "-"].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              disabled
                              label="Price"
                              value={service.service_rate || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Display the calculated amount */}
                          <Grid item xs={12} sm={6} md={1.5}>
                            <TextField
                              label="MWO Amount"
                              value={
                                crMwoServices[index]?.service_cr_price || // Access from crMwoServices
                                serviceLineItems[index]?.service_amount || // Fallback to original
                                (
                                  (Number(service.service_wo_qty) || 0) *
                                  (Number(service.service_rate) || 0)
                                ).toFixed(2)
                              }
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Remove checkbox or delete button */}
                          <Grid item xs={12} sm={6} md={1}>
                            {crMwoServices[index]?.is_added ? (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => {
                                  // Remove from both arrays
                                  setServiceLineItems((prevItems) =>
                                    prevItems.filter((_, idx) => idx !== index)
                                  );
                                  setCrMwoServices((prevItems) =>
                                    prevItems.filter((_, idx) => idx !== index)
                                  );
                                }}
                              >
                                Delete
                              </Button>
                            ) : (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={
                                      crMwoServices[index]?.is_removed ||
                                      serviceLineItems[index]?.is_removed ||
                                      false
                                    }
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setServiceLineItems((prevItems) =>
                                        prevItems.map((item, idx) =>
                                          idx === index
                                            ? { ...item, is_removed: checked }
                                            : item
                                        )
                                      );

                                      // Also update crMwoServices
                                      setCrMwoServices((prevItems) =>
                                        prevItems.map((item, idx) =>
                                          idx === index
                                            ? { ...item, is_removed: checked }
                                            : item
                                        )
                                      );
                                    }}
                                    color="primary"
                                  />
                                }
                                label="Remove"
                              />
                            )}
                          </Grid>
                        </React.Fragment>
                      ))}
                    <Box
                      mt={1}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Total Service Cost:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        ₹{totalServiceAmount.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Add new service section */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 0.5,
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Add New Service
                      </Typography>{" "}
                      <Grid container spacing={0.5} mt={0.5}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            disablePortal
                            id="service-id"
                            options={
                              Array.isArray(allServices) &&
                              allServices.length > 0
                                ? [...allServices]
                                    .filter(
                                      (service) =>
                                        !Array.isArray(serviceLineItems) ||
                                        !serviceLineItems.some(
                                          (lineItem) =>
                                            lineItem.service_id ===
                                            service.service_id
                                        )
                                    )
                                    .sort(
                                      (a, b) =>
                                        b.service_id?.localeCompare(
                                          a.service_id || ""
                                        ) || 0
                                    )
                                : [] // If allServices is empty or not an array, use an empty array
                            }
                            getOptionLabel={(option) =>
                              option && option.service_id
                                ? `${option.service_id} - ${
                                    option.service_desc ||
                                    option.service_description ||
                                    "No Description"
                                  }`
                                : ""
                            }
                            value={
                              Array.isArray(allServices) &&
                              allServices.length > 0
                                ? allServices.find(
                                    (service) =>
                                      service.service_id === selectedServiceId
                                  ) || null
                                : null // Return null if allServices is empty or not an array
                            }
                            onChange={(event, newValue) => {
                              if (newValue) {
                                const selectedService = newValue;
                                setSelectedServiceId(
                                  selectedService.service_id
                                );
                                const qty = Number(
                                  selectedService.service_qty || 0
                                );
                                const rate = Number(
                                  selectedService.service_rate || 0
                                );

                                // First, get the current service ID to add
                                const serviceIdToAdd =
                                  selectedService.service_id;

                                // Add to serviceLineItems - ensure prevItems is an array
                                setServiceLineItems((prevItems) => [
                                  ...(Array.isArray(prevItems)
                                    ? prevItems
                                    : []),
                                  {
                                    service_id: selectedService.service_id,
                                    service_desc:
                                      selectedService.service_description ||
                                      selectedService.service_desc,
                                    service_uom:
                                      selectedService.service_UOM ||
                                      selectedService.service_uom,
                                    service_rate: selectedService.service_rate,
                                    service_price: (qty * rate).toFixed(2), // original price
                                    service_cwo_price: (qty * rate).toFixed(2), // set cwo price
                                    service_wo_qty: qty, //set default value
                                    error: "",
                                    remove: false, // Default remove checkbox unchecked
                                  },
                                ]);

                                // Add to crMwoServices while preserving existing items
                                setCrMwoServices((prevItems) => {
                                  // Create a new item for the added service
                                  const newItem = {
                                    service_id: selectedService.service_id,
                                    cr_qty: newServiceQty || "0",
                                    old_qty: "0", // Set to 0 for new items
                                    service_cr_price: (qty * rate).toFixed(2),
                                    is_added: true, // Mark as added
                                    service_desc:
                                      selectedService.service_description ||
                                      selectedService.service_desc,
                                    uom:
                                      selectedService.service_UOM ||
                                      selectedService.service_uom,
                                    price: selectedService.service_rate,
                                  };

                                  // Return the previous items plus the new one
                                  return [
                                    ...(Array.isArray(prevItems)
                                      ? prevItems
                                      : []),
                                    newItem,
                                  ];
                                });
                              } else {
                                setSelectedServiceId(""); // Clear selection when user deletes
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (!newInputValue) {
                                setSelectedServiceId(""); // Clear the selected service when input is cleared
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Service ID"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                            clearOnEscape
                            isOptionEqualToValue={(option, value) =>
                              option.service_id === value.service_id
                            }
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            label="New Quantity"
                            type="number"
                            value={newServiceQty}
                            onChange={(e) => setNewServiceQty(e.target.value)}
                            onKeyDown={(e) => {
                              if (["e", "E", "-"].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddService}
                            disabled={!selectedServiceId || !newServiceQty}
                            fullWidth
                          >
                            Add Service
                          </Button>
                        </Grid>
                        {serviceError && (
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "error.main",
                                backgroundColor: "#ffebee",
                                p: 1,
                                borderRadius: 1,
                                mt: 1,
                                fontWeight: "medium",
                              }}
                            >
                              {serviceError}
                            </Typography>
                          </Grid>
                        )}

                        {/* Display selected service details */}
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Materials Section */}
              <Card
                sx={{
                  p: "4px 8px",
                  mb: 0.5,
                  borderRadius: "4px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 0.25,
                    color: "green",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Materials
                </Typography>
                <CardContent>
                  <Grid container spacing={0.5} mt={0}>
                    {Array.isArray(materialLineItems) &&
                      materialLineItems.map((material, index) => (
                        <React.Fragment key={material.record_id || index}>
                          {/* ID */}
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              disabled
                              label="ID"
                              value={material.material_id || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Description */}
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              disabled
                              label="Description"
                              value={material.material_desc || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* UOM */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              disabled
                              label="UOM"
                              value={material.material_uom || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Original Quantity */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              disabled
                              label="Original Qty"
                              value={
                                crMwoMaterials[index]?.old_qty !== undefined
                                  ? crMwoMaterials[index].old_qty
                                  : material.material_wo_qty || ""
                              }
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Editable Quantity */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              label="New Quantity"
                              type="number"
                              inputProps={{ min: 0 }}
                              value={
                                crMwoMaterials[index]?.cr_qty !== undefined
                                  ? crMwoMaterials[index].cr_qty
                                  : material.material_wo_qty || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const crQty = Number(value);

                                setCrMwoMaterials((prevItems) =>
                                  prevItems.map((item, idx) =>
                                    idx === index
                                      ? {
                                          ...item,
                                          cr_qty: value,
                                          material_cr_price: (
                                            crQty *
                                            Number(material.material_rate)
                                          ).toFixed(2),
                                        }
                                      : item
                                  )
                                );
                              }}
                              onKeyDown={(e) => {
                                if (["e", "E", "-"].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Price */}
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              disabled
                              label="Price"
                              value={material.material_rate || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* CWO Amount – dynamic based on edit */}
                          <Grid item xs={12} sm={6} md={1.5}>
                            <TextField
                              label="MWO Amount"
                              value={
                                crMwoMaterials[index]?.material_cr_price || // Access from crMwoMaterials
                                materialLineItems[index]?.material_price || // Fallback to original from materialLineItems
                                ""
                              }
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          {/* Remove checkbox or delete button */}
                          <Grid item xs={12} sm={6} md={1}>
                            {crMwoMaterials[index]?.is_added ? (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => {
                                  // Remove from both arrays
                                  setMaterialLineItems((prevItems) =>
                                    prevItems.filter((_, idx) => idx !== index)
                                  );
                                  setCrMwoMaterials((prevItems) =>
                                    prevItems.filter((_, idx) => idx !== index)
                                  );
                                }}
                              >
                                Delete
                              </Button>
                            ) : (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={
                                      crMwoMaterials[index]?.is_removed ||
                                      materialLineItems[index]?.is_removed ||
                                      false
                                    }
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setMaterialLineItems((prevItems) =>
                                        prevItems.map((item, idx) =>
                                          idx === index
                                            ? { ...item, is_removed: isChecked }
                                            : item
                                        )
                                      );

                                      // Also update crMwoMaterials
                                      setCrMwoMaterials((prevItems) =>
                                        prevItems.map((item, idx) =>
                                          idx === index
                                            ? { ...item, is_removed: isChecked }
                                            : item
                                        )
                                      );
                                    }}
                                    color="secondary"
                                  />
                                }
                                label="Remove"
                              />
                            )}
                          </Grid>
                        </React.Fragment>
                      ))}

                    <Box
                      mt={1}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Total Material Cost:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        ₹{totalMaterialAmount.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Add New Material */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 0.5,
                          color: "green",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Add New Material
                      </Typography>{" "}
                      <Grid container spacing={0.5} mt={0.5}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            disablePortal
                            id="material-id"
                            options={
                              Array.isArray(allMaterials) &&
                              allMaterials.length > 0
                                ? [...allMaterials]
                                    .filter(
                                      (material) =>
                                        !Array.isArray(materialLineItems) ||
                                        !materialLineItems.some(
                                          (lineItem) =>
                                            lineItem.material_id ===
                                            material.item_id
                                        )
                                    )
                                    .sort(
                                      (a, b) =>
                                        b.item_id?.localeCompare(
                                          a.item_id || ""
                                        ) || 0
                                    )
                                : [] // If motherMaterials is empty or not an array, use an empty array
                            }
                            getOptionLabel={(option) =>
                              option && option.item_id
                                ? `${option.item_id} - ${option.item_name}`
                                : ""
                            }
                            value={
                              Array.isArray(allMaterials) &&
                              allMaterials.length > 0
                                ? allMaterials.find(
                                    (material) =>
                                      material.material_id ===
                                      selectedMaterialId
                                  ) || null // Return null if not found
                                : null
                            }
                            onChange={(event, newValue) => {
                              if (newValue) {
                                const selectedMaterial = newValue;
                                setSelectedMaterialId(
                                  selectedMaterial.material_id
                                );
                                const qty = Number(
                                  selectedMaterial.material_wo_qty || 0
                                );
                                const rate = Number(
                                  selectedMaterial.material_rate || 0
                                );

                                // First, get the current material ID to add
                                const materialIdToAdd =
                                  selectedMaterial.material_id;

                                // Add to materialLineItems - ensure prevItems is an array
                                setMaterialLineItems((prevItems) => [
                                  ...(Array.isArray(prevItems)
                                    ? prevItems
                                    : []),
                                  {
                                    material_id: selectedMaterial.item_id,
                                    material_desc: selectedMaterial.item_name,
                                    material_uom: selectedMaterial.item_uom,
                                    material_rate: selectedMaterial.item_rate,
                                    material_price: (qty * rate).toFixed(2), // original price
                                    material_cwo_price: (qty * rate).toFixed(2), // set cwo price
                                    error: "",
                                    isRemove: false, // Initialize with remove unchecked
                                  },
                                ]);

                                // Add to crMwoMaterials while preserving existing items
                                setCrMwoMaterials((prevItems) => {
                                  // Create a new item for the added material
                                  const newItem = {
                                    material_id: selectedMaterial.item_id,
                                    cr_qty: newMaterialQty || "0",
                                    old_qty: "0", // Set to 0 for new items
                                    material_cr_price: (qty * rate).toFixed(2),
                                    is_added: true, // Mark as added
                                    material_desc: selectedMaterial.item_name,
                                    uom: selectedMaterial.item_uom,
                                    price: selectedMaterial.item_rate,
                                  };

                                  // Return the previous items plus the new one
                                  return [
                                    ...(Array.isArray(prevItems)
                                      ? prevItems
                                      : []),
                                    newItem,
                                  ];
                                });
                              } else {
                                setSelectedMaterialId(""); // Clear selection when user deletes
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (!newInputValue) {
                                setSelectedMaterialId(""); // Clear the selected material when input is cleared
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Material ID"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                            clearOnEscape
                            isOptionEqualToValue={(option, value) =>
                              option.material_id === value.material_id
                            }
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            label="New Quantity"
                            type="number"
                            value={newMaterialQty}
                            onChange={(e) => setNewMaterialQty(e.target.value)}
                            onKeyDown={(e) => {
                              if (["e", "E", "-"].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddMaterial}
                            disabled={!selectedMaterialId || !newMaterialQty}
                            fullWidth
                          >
                            Add Material
                          </Button>
                        </Grid>
                        {materialError && (
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "error.main",
                                backgroundColor: "#ffebee",
                                p: 1,
                                borderRadius: 1,
                                mt: 1,
                                fontWeight: "medium",
                              }}
                            >
                              {materialError}
                            </Typography>
                          </Grid>
                        )}

                        {/* Display selected material details */}
                        {selectedMaterialId && (
                          <Grid item xs={12}>
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                  label="ID"
                                  value={
                                    allMaterials.find(
                                      (material) =>
                                        material.material_id ===
                                        selectedMaterialId
                                    )?.item_id || ""
                                  }
                                  InputProps={{ readOnly: true }}
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Description"
                                  value={
                                    allMaterials.find(
                                      (material) =>
                                        material.material_id ===
                                        selectedMaterialId
                                    )?.item_name || "No Description" // Default if not found
                                  }
                                  InputProps={{ readOnly: true }}
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                  label="UOM"
                                  value={
                                    allMaterials.find(
                                      (material) =>
                                        material.material_id ===
                                        selectedMaterialId
                                    )?.item_uom || "" // Default if not found
                                  }
                                  InputProps={{ readOnly: true }}
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                  label="Rate"
                                  value={
                                    allMaterials.find(
                                      (material) =>
                                        material.material_id ===
                                        selectedMaterialId
                                    )?.item_rate || "Not Available" // Default if not found
                                  }
                                  InputProps={{ readOnly: true }}
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                  label="Available Quantity"
                                  value={
                                    allMaterials.find(
                                      (material) =>
                                        material.material_id ===
                                        selectedMaterialId
                                    )?.material_wo_qty || "0" // Default if not found
                                  }
                                  InputProps={{ readOnly: true }}
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button variant="outlined" onClick={resetForm}>
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </div>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ChangeRequestMWO;
