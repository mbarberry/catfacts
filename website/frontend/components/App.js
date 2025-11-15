import { useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CatFacts from './CatFacts';

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway',
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <CatFacts />,
  },
  {
    path: '*',
    element: <h1>404: Page not found</h1>,
  },
]);

export default function Container() {
  useEffect(() => {
    import('darkreader').then((dr) =>
      dr.enable({ brightness: 100, contrast: 90, sepia: 10 })
    );
  }, []);
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}
