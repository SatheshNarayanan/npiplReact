import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function createData(name, calories, fat, carbs, protein, price) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    history: [
      {
        date: "2020-01-05",
        customerId: "11091700",
        amount: 3,
      },
      {
        date: "2020-01-02",
        customerId: "Anonymous",
        amount: 1,
      },
    ],
  };
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.invoiceNo}
        </TableCell>
        {/* <TableCell align="right">{row.customerCode}</TableCell>
        <TableCell align="right">{row.customerName}</TableCell> */}
        <TableCell align="right">{row.totalOrderAmount}</TableCell>
        <TableCell align="right">{row.existingDiscountAmount}</TableCell>
        <TableCell align="right" >
          {row.maxInvoiceAmountDiscountPercent.toFixed(2)}
        </TableCell>
        <TableCell align="right">{row.maxInvoiceAmountDiscount}</TableCell>
        <TableCell align="right">{row.totalNewOrderAmount}</TableCell>
        <TableCell align="right">{row.newGstAmount}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Items
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">MRP</TableCell>
                    <TableCell align="right">Old Taxable Value </TableCell>
                    <TableCell align="right">Old Discount %</TableCell>

                    <TableCell align="right">New Discount % </TableCell>
                    <TableCell align="right">New Discount </TableCell>
                    <TableCell align="right">New Taxable Value</TableCell>

                    <TableCell align="right">GST %</TableCell>
                    <TableCell align="right">New CGST</TableCell>
                    <TableCell align="right">New SGST</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((historyRow) => (
                    <TableRow key={historyRow.sku}>
                      <TableCell component="th" scope="row">
                        {historyRow.sku}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.itemAmountOld)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.actualPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {historyRow.itemDiscountOld}
                      </TableCell>

                      <TableCell align="right">
                        {historyRow.itemDiscountPercentNew}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.itemDiscountNew)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.itemAmountNew)}
                      </TableCell>

                      <TableCell align="right">{historyRow.gst}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.cgst)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(historyRow.sgst)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
};

export default function CollapsibleTable(props) {
  const { header, data } = props;
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table" sx={{ color: "white !important" }}>
        <TableHead>
          <TableRow>
            <TableCell />
            {header.map((element, index) => {
              if (index === 0) return <TableCell>{element}</TableCell>;
              else return <TableCell align="right">{element}</TableCell>;
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row key={index} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
