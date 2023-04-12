import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import FilledInput from "@mui/material/FilledInput";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { padding } from "@mui/system";
import { ApplicationContext } from "../../contexts/ApplicaitonContext";
import { redirect, useNavigate } from "react-router-dom";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

function TransitionLeft(props) {
  return <Slide {...props} direction="right" />;
}

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function InputAdornments() {
  const [data, setData] = React.useState({
    username: "",
    password: "",
  });
  const navigation = useNavigate();
  const { state, setState } = React.useContext(ApplicationContext);
  const [redirectState, setRedirectState] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [openAlert, setOpenAlert] = React.useState({
    open:false,
    severity : "error",
    msg : ""
  });

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert({
      open:false,
      severity : "error",
      msg : ""
    });
  };

  const handleChange = (e) => {
    setData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const handleLogin = () => {
    handleToggle(true)
    let login = false
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(data);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let redirector = fetch(
      "http://68.183.93.166:8080/erp-api-0.0.1/erp-api/auth/login",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let data = JSON.parse(result);
        console.log(data);
        setState((prevState) => ({
          ...prevState,
          employeeInfo: data.employee,
          token: data.token,
        }));
        localStorage.setItem(
          "login",
          JSON.stringify({ employeeInfo: data.employee, token: data.token })
        );
        if(data.status == 500){
          login  = false
        } else {
          login = true
        }
        // setRedirectState(true);
        return true;
      })
      .catch((error) => {
        login = false
        console.log("error", error);
        return false;
      });
    setTimeout(() => {
      handleToggle(false)
      console.log("XX",login)
      if(login){
        setRedirectState(redirector);
      }else{
        setOpenAlert({
          open:true,
          msg:"Invalid Login Credentials",
          severity:"error"
        })
      }
    },1000)
  };
  const [open, setOpen] = React.useState(false);
  const handleToggle = (bool) => {
    setOpen(bool);
  };

  if (redirectState) return navigation(`/Dashboard`);
  

  return (
    <>
    <Snackbar open={openAlert.open} autoHideDuration={6000} onClose={handleCloseAlert} TransitionComponent={TransitionLeft}>
        <Alert onClose={handleCloseAlert} severity={openAlert.severity} sx={{ width: '100%' }}>
          {openAlert.msg}
        </Alert>
      </Snackbar>
     <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleToggle}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    <Grid
      container
      spacing={2}
      direction="row"
      style={{ width: "100%", height: "100%" }}
    >
      <Grid item xs={1} sm={3} style={{ backgroundColor: "#ebcddd" , height:"100vh"}}></Grid>
      <Grid item xs={10} sm={6}>
        <Paper style={{ padding: "15px" ,paddingTop:"17vh",  height:"100vh"}} variant="outlined">
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Grid item sm={12}>
              <img alt="logo" src="https://i.pinimg.com/280x280_RS/fa/ce/4d/face4d8983881a9863213f333cf5dc55.jpg" style={{minHeight:"200px", minWidth:"200px"}} />
            </Grid>
            <Grid item sm={10}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-username">
                  Username
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-username"
                  name="username"
                  type="text"
                  endAdornment={
                    <InputAdornment position="end">
                      <AccountCircle />
                    </InputAdornment>
                  }
                  label="Username"
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid item sm={10}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  onChange={handleChange}
                  label="Password"
                />
              </FormControl>
            </Grid>
            <Grid item sm={10}>
              <Button variant="contained" onClick={handleLogin}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={1} sm={3} style={{ backgroundColor: "#ebcddd" , height:"100vh"}}></Grid>
    </Grid>
    </>
  );
}
