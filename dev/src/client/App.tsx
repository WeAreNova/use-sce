import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import { LocalizationProvider } from "@mui/lab";
import MomentAdapter from "@mui/lab/AdapterMoment";
import { Box, createTheme, CssBaseline, IconButton, TableContainer, ThemeProvider } from "@mui/material";
import DataTable, { setDefaultCurrency } from "@wearenova/mui-data-table";
import useSSE, { usePreloadedState } from "@wearenova/use-sse";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useCallback, useEffect, useState } from "react";
import { STRUCTURE, User } from "./utils";

interface AppProps {
  darkMode?: boolean;
}

setDefaultCurrency("USD");

function App({ darkMode: darkModeProp }: AppProps) {
  const [darkMode, setDarkMode] = useState(darkModeProp);
  const preloadedData = usePreloadedState<{ data: User[] }>("data");
  const [data, setData] = useState<User[]>(preloadedData ?? []);

  const toggleDarkMode = useCallback(() => setDarkMode((currDarkMode) => !currDarkMode), []);

  useEffect(() => {
    Cookies.set("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleChange = useCallback(async () => {
    const res = await axios.get<User[]>("http://localhost:3000/api/data");
    setData(res.data);
    return res.data;
  }, []);

  useSSE(() => handleChange(), [handleChange], "data");

  return (
    <ThemeProvider
      theme={createTheme({
        palette: { mode: darkMode ? "dark" : "light" },
      })}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={MomentAdapter}>
        <Box display="flex" justifyContent="flex-end" marginBottom={2} paddingRight={1} paddingTop={1}>
          <IconButton onClick={toggleDarkMode}>{darkMode ? <Brightness7 /> : <Brightness4 />}</IconButton>
        </Box>
        <Box>
          <TableContainer>
            <DataTable
              tableData={data}
              tableStructure={STRUCTURE}
              onChange={handleChange}
              rowClick={(data: any) => console.log(data)}
              // onEdit={() => "test"}
              exportToCSVOption
              rowsSelectable
              resizeable
            />
          </TableContainer>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
