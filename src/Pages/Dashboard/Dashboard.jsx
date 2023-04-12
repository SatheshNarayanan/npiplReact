import { Grid, Paper } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import dateFormat from "dateformat";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { ApplicationContext } from "../../contexts/ApplicaitonContext";
import CollapsibleTable from "../../Components/Datatable";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import xlsx from "json-as-xlsx";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { redirect, useNavigate } from "react-router-dom";
import { tab } from "@testing-library/user-event/dist/tab";

function TransitionLeft(props) {
  return <Slide {...props} direction="right" />;
}

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Dashboard = () => {
  const navigation = useNavigate();
  const { state } = useContext(ApplicationContext);
  const [openAlert, setOpenAlert] = React.useState({
    open: false,
    severity: "error",
    msg: "",
  });

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert({
      open: false,
      severity: "error",
      msg: "",
    });
  };
  const [apiResult, setApiResult] = React.useState({
    data: [],
    sumData: {},
  });
  let [token, setToken] = React.useState("");

  React.useEffect(() => {
    try {
      let login = JSON.parse(localStorage.getItem("login"));
      setToken(login.token);
    } catch {
      navigation(`/`);
    }
  }, []);

  const [tableData, setTableData] = React.useState([]);

  const [data, setData] = React.useState({
    fromDate: null,
    toDate: null,
    storeCode: "",
    sum: 0,
  });

  const [generatedData, setGeneratedData] = React.useState({
    resultantInvoiceAmount: 0,
    resultantDeduction: 0,
  });

  const handleDateChange = (type, date) => {
    console.log(type, dateFormat(date, "yyyy-mm-dd"), state);
    setData((prevState) => {
      return { ...prevState, [type]: date };
    });
  };

  const handleChange = (e) => {
    setData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = (bool) => {
    setOpen(bool);
  };

  const excelGenerate = () => {
    let data = [
      {
        sheet: "NPIPL",
        columns: [
          { label: "Invoice No", value: "invoiceNo" }, // Top level data
          { label: "Invoice Amount", value: "totalOrderAmount" }, // Custom format
          { label: "Old Invoice Discount", value: "existingDiscountAmount" }, // Run functions
          { label: "New Invoice Discount", value: "maxInvoiceAmountDiscount" }, // Run functions
        ],
        content: tableData,
      },
    ];
    let settings = {
      fileName: "MySpreadsheet", // Name of the resulting spreadsheet
      extraLength: 3, // A bigger number means that columns will be wider
      writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
      writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
      RTL: true, // Display the columns from right-to-left (the default value is false)
    };
    xlsx(data, settings); // Will download the excel file
  };

  const handleGenerate = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    if (token) {
      if (
        apiResult?.sumData?.maxDiscountValue -
          apiResult?.sumData?.existingDisc <=
          parseFloat(data.sum) ||
        isNaN(
          apiResult?.sumData?.maxDiscountValue -
            apiResult?.sumData?.existingDisc +
            // apiResult?.sumData?.existingDisc
            -parseFloat(data.sum)
        )
      ) {
        setOpenAlert({
          open: true,
          severity: "error",
          msg: "Please provide a valid amount",
        });
        return;
      }
      handleToggle(true);
      var raw = JSON.stringify({
        ...data,
        fromDate: dateFormat(data.fromDate, "yyyy-mm-dd"),
        toDate: dateFormat(data.toDate, "yyyy-mm-dd"),
        token: token,
        sum: apiResult?.sumData?.existingDisc + parseFloat(data.sum),
      });
      console.log(
        "==>x",
        data.sum,
        -(
          apiResult?.sumData?.consolidatedInvoiceValue +
          apiResult?.sumData?.existingDisc
        ) - parseFloat(data.sum),
        generatedData.resultantInvoiceAmount,
        generatedData.resultantDeduction
      );
      var requestOptions = {
        method: "POST",
        body: raw,
        redirect: "follow",
      };

      fetch("http://localhost:3001/fetchOrders", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let resultant = JSON.parse(result);
          console.log(JSON.parse(result));
          setApiResult(JSON.parse(result));
          setGeneratedData(() => {
            let maxDiscount =
              typeof resultant?.sumData?.resultantValue != "undefined"
                ? Object.values(resultant?.sumData?.resultantValue).reduce(
                    (partialSum, a) => {
                      partialSum.discount += a.maxInvoiceAmountDiscount;                     
                      partialSum.actuals +=  (a.itemDetails.reduce((partials,as) => {
                            return partials + as.itemAmountNew + as.cgst + as.sgst;
                      },0))
                    
                      console.log("=====>", partialSum);
                      return partialSum;
                    },
                    {
                      discount: 0,
                      actuals: 0,
                    }
                  )
                : 0;
            console.log(
              "=====>",
              maxDiscount,
              resultant?.sumData?.resultantValue
            );
            return {
              resultantInvoiceAmount:
                maxDiscount.actuals ,
                //- maxDiscount.discount + apiResult?.sumData?.existingDisc,
              resultantDeduction: maxDiscount.discount,
            };
          });
          if (resultant?.data.length > 0) {
            setTableData(
              resultant.data.map((innel, inx) => {
                let bool =
                  typeof resultant?.sumData?.resultantValue != "undefined"
                    ? resultant?.sumData?.resultantValue[innel.orderNo]
                      ? true
                      : false
                    : false;
                return {
                  invoiceNo: innel.orderNo,
                  customerCode: innel.customerCode,
                  customerName: innel.customerName,
                  totalOrderAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[innel.orderNo]
                          ?.invoiceTotalOld
                      : 0
                  ),
                  totalNewOrderAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[
                          innel.orderNo
                        ]?.itemDetails.reduce(
                          (partialSum, a) => partialSum + a.itemAmountNew + a.cgst + a.sgst,
                          0
                        )
                      : 0
                  ),
                  newGstAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[
                          innel.orderNo
                        ]?.itemDetails.reduce(
                          (partialSum, a) =>
                            // partialSum + a.itemAmountNew * (a.gst / 100),
                            partialSum + a.cgst + a.sgst,
                          0
                        )
                      : 0
                  ),
                  existingDiscountAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(parseFloat(innel.discount)),
                  maxInvoiceAmountDiscount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[innel.orderNo]
                          ?.maxInvoiceAmountDiscount
                      : 0
                  ),
                  maxInvoiceAmountDiscountPercent: bool
                    ? resultant?.sumData?.resultantValue[innel.orderNo]
                        ?.maxInvoiceAmountDiscountPercent
                    : 0,
                  items: bool
                    ? resultant?.sumData?.resultantValue[
                        innel.orderNo
                      ]?.itemDetails.map((itemEl, index) => {
                        return {
                          itemAmountOld: itemEl.itemAmountOld,
                          itemDiscountOld: itemEl.itemDiscountOld,
                          itemAmountNew: itemEl.itemAmountNew,
                          itemDiscountNew: itemEl.itemDiscountNew,
                          itemDiscountPercentNew: itemEl.itemDiscountPercentNew,
                          sku: innel?.items[0][index]?.sku,
                          actualPrice: innel?.items[0][index]?.actualPrice,
                          gst: itemEl.gst,
                          cgst: itemEl.cgst,
                          sgst: itemEl.sgst,
                        };
                      })
                    : [],
                };
              })
            );
          }
          handleToggle(false);
        })
        .catch((error) => {
          console.log("error", error);
          handleToggle(false);
          setOpenAlert({
            open: true,
            severity: "error",
            msg: error,
          });
        });
    }
  };

  const handleSearch = () => {
    handleToggle(true);
    // console.log("===>", state);
    setData((prevState) => {
      return { ...prevState, sum: 0 };
    });
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    if (token) {
      var raw = JSON.stringify({
        ...data,
        fromDate: dateFormat(data.fromDate, "yyyy-mm-dd"),
        toDate: dateFormat(data.toDate, "yyyy-mm-dd"),
        sum:0,
        token: token,
      });
      var requestOptions = {
        method: "POST",
        body: raw,
        redirect: "follow",
      };

      fetch("http://localhost:3001/fetchOrders", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let resultant = JSON.parse(result);
          console.log(JSON.parse(result));

          setApiResult(JSON.parse(result));
          if (resultant?.data.length > 0) {
            setTableData(
              resultant.data.map((innel, inx) => {
                let bool =
                  typeof resultant?.sumData?.resultantValue != "undefined"
                    ? resultant?.sumData?.resultantValue[innel.orderNo]
                      ? true
                      : false
                    : false;
                return {
                  invoiceNo: innel.orderNo,
                  customerCode: innel.customerCode,
                  customerName: innel.customerName,
                  totalOrderAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[innel.orderNo]
                          ?.invoiceTotalOld
                      : 0
                  ),
                  totalNewOrderAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[
                          innel.orderNo
                        ]?.itemDetails.reduce(
                          (partialSum, a) => partialSum + a.itemAmountNew + a.cgst + a.sgst,
                          0
                        )
                      : 0
                  ),
                  newGstAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[
                          innel.orderNo
                        ]?.itemDetails.reduce(
                          (partialSum, a) =>
                            //partialSum + a.itemAmountNew * (a.gst / 100),
                            partialSum + a.cgst + a.sgst,
                          0
                        )
                      : 0
                  ),
                  existingDiscountAmount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(parseFloat(innel.discount)),
                  maxInvoiceAmountDiscount: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(
                    bool
                      ? resultant?.sumData?.resultantValue[innel.orderNo]
                          ?.maxInvoiceAmountDiscount
                      : 0
                  ),
                  maxInvoiceAmountDiscountPercent: bool
                    ? resultant?.sumData?.resultantValue[innel.orderNo]
                        ?.maxInvoiceAmountDiscountPercent
                    : 0,
                  items: bool
                    ? resultant?.sumData?.resultantValue[
                        innel.orderNo
                      ]?.itemDetails.map((itemEl, index) => {
                        return {
                          itemAmountOld: itemEl.itemAmountOld,
                          itemDiscountOld: itemEl.itemDiscountOld,
                          itemAmountNew: itemEl.itemAmountNew,
                          itemDiscountNew: itemEl.itemDiscountNew,
                          itemDiscountPercentNew: itemEl.itemDiscountPercentNew,
                          sku: innel?.items[0][index]?.sku,
                          actualPrice: innel?.items[0][index]?.actualPrice,
                          gst: itemEl.gst,
                          cgst: itemEl.cgst,
                          sgst: itemEl.sgst,
                        };
                      })
                    : [],
                };
              })
            );
          }
          handleToggle(false);
        })
        .catch((error) => {
          console.log("error", error);
          handleToggle(false);
          setOpenAlert({
            open: true,
            severity: "error",
            msg: error,
          });
        });
    }
  };

  const handleSave = () => {
    tableData.map((element, index) => {
      return {
        invoiceNo: element?.invoiceNo,
        saleProductList: {
          sku: "string",
          oldSku: "string",
          discount: "string",
          finalPrice: "string",
          saleProductCalculation: {
            gstPercent: "string",
            gstValue: "string",
            sgstValue: "string",
            sgstValue: "string",
            discountPercent: "string",
            discountValue: "string",
            setDiscountPercent: "string",
            setDiscountValue: "string",
            totalDiscountPercent: "string",
            totalDiscountValue: "string",
            price: "string",
            grossValue: "string",
            setDiscountAdded: "string",
          },
        },
        saleDiscount: {
          totalDiscount: "string",
          totalProdDiscount: "string",
          totalSplDiscount: "string",
          setDiscount: "string",
          loyaltyDiscount: "string",
          splDiscountPercent: "string",
          splDiscountAmount: "string",
        },
        subTotal: "string",
        total: "string",
        paidAmount: "string",
        roundOff: "string",
      };
    });
  };

  let header = [
    "Invoice No",
    // "Customer Code",
    // "Customer Name",
    "Invoice Amount",
    "Old Discount",
    "New Discount %",
    "New Discount",
    "New Invoice Amount",
    "New GST Amount",
  ];
  return (
    <>
      <Snackbar
        open={openAlert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        TransitionComponent={TransitionLeft}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={openAlert.severity}
          sx={{ width: "100%" }}
        >
          {openAlert.msg}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      <Grid container spacing={1} style={{marginTop:"5px", margin:"5px 5px 0px 5px" , maxWidth:"98.5vw"}}>
        <Grid item xs={10} sm={7}>
          <Paper
            variant="outlined"
            style={{ padding: "20px", minHeight: "100px !important" }}
          >
            <Grid
              container
              spacing={1}
              alignItems="center"
              justifyContent={"center"}
            >
              <Grid item sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="store">Store</InputLabel>
                  <Select
                    labelId="store"
                    id="demo-simple-select"
                    value={data.storeCode}
                    label="Store"
                    name="storeCode"
                    onChange={handleChange}
                  >
                    <MenuItem value={"HO"}>HO</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From Date"
                    name="fromDate"
                    onChange={(e) => handleDateChange("fromDate", e)}
                    value={data.fromDate}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item sm={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To Date"
                    name="toDate"
                    onChange={(e) => handleDateChange("toDate", e)}
                    value={data.toDate}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item sm={2}>
                <Button variant="contained" onClick={handleSearch}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={10} sm={5}>
          <Paper
            variant="outlined"
            style={{
              padding: "25px 20px",
              textAlign: "center",
              minHeight: "100px !important",
            }}
          >
            <Grid container spacing={1}>
              <Grid Item xs={4} sm={4}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12}>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(
                      apiResult?.sumData?.consolidatedInvoiceValue
                        ? apiResult?.sumData?.consolidatedInvoiceValue
                        : 0
                    )}
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    Total Invoice Amt
                  </Grid>
                </Grid>
              </Grid>
              <Grid Item xs={4} sm={4}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12}>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(
                      apiResult?.sumData?.existingDisc
                        ? apiResult?.sumData?.existingDisc
                        : 0
                    )}
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    Existing Discount
                  </Grid>
                </Grid>
              </Grid>
              <Grid Item xs={4} sm={4}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12}>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(
                      apiResult?.sumData?.maxDiscountValue
                        ? // ? apiResult?.sumData?.consolidatedInvoiceValue -
                          apiResult?.sumData?.maxDiscountValue -
                            apiResult?.sumData?.existingDisc
                        : 0
                    )}
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    Available Discount
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={10} sm={12} style={{ margin: "0px 0px 5px 0px" }}>
          <Paper
            variant="outlined"
            style={{
              padding: "20px 0px 15px 25px",
              minHeight: "100px !important",
              textAlign: "center",
            }}
          >
            <Grid
              container
              spacing={1}
              alignItems="center"
              justifyContent={"center"}
            >
              <Grid item xs={3} sm={3}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="outlined-adornment-username">
                    Discount Availing
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-username"
                    name="sum"
                    type="number"
                    label="Discount Availing"
                    onChange={handleChange}
                    value={data.sum}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={3} sm={1}>
                <Button variant="contained" onClick={handleGenerate}>
                  Generate
                </Button>
              </Grid>
              <Grid item xs={3} sm={2}>
                <Button variant="contained" onClick={excelGenerate}>
                  Generate Excel
                </Button>
              </Grid>
              <Grid item xs={3} sm={1}>
                <Button variant="contained" onClick={excelGenerate}>
                  Save
                </Button>
              </Grid>
              <Grid item xs={6} sm={5}>
                <Grid container spacing={2}>
                  <Grid Item xs={6} sm={6}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={12}>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(
                          generatedData?.resultantInvoiceAmount
                            ? generatedData?.resultantInvoiceAmount
                            : 0
                        )}
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        New Invoice Amount
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid Item xs={6} sm={6}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={12}>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(
                          generatedData?.resultantDeduction
                            ? generatedData?.resultantDeduction
                            : 0
                        )}
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        New Discount
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={12}>
          <CollapsibleTable header={header} data={tableData} />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
