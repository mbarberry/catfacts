import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import { SiPython } from "react-icons/si";

import { Start, Pygame } from "./Pygame";
import loadingCat from "../../public/inked_loading_cat.jpg";
import avatar from "../../public/avatar.webp";
import { LAMBDA_URL, shouldUpdateRuns } from "../utils";

export default function CatFacts() {
  const catsRef = useRef([]);
  const [mobile, _] = useState(window.outerWidth <= 720);
  const [currCat, setCurrCat] = useState(-1);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedAll, setFetchedAll] = useState(false);
  const [runs, setRuns] = useState(null);

  useEffect(() => {
    let subscribed = true;
    const fetchRuns = async () => {
      const response = await fetch(`${LAMBDA_URL}/run`);
      const json = await response.json();
      const { count } = json;
      if (subscribed) {
        setRuns(count);
      }
    };
    fetchRuns();
    return () => {
      subscribed = false;
    };
  }, []);

  const loadingCatImg = (
    <Box
      component="img"
      src={loadingCat}
      sx={{
        width: "400px",
        height: "auto",
      }}
    ></Box>
  );

  const intervalFn = (fetchedAll, currCat, n) => {
    if (fetchedAll && currCat === n - 1) {
      setCurrCat(0);
    } else {
      setCurrCat((currCat) => currCat + 1);
    }
  };

  // Invoked when running or currCat changes.
  // Immediately shows first cat. Sets a 10s
  // delay before going to the next.
  useEffect(() => {
    let id;

    if (running) {
      if (currCat === -1) {
        setCurrCat((currCat) => currCat + 1);
      } else {
        id = setTimeout(() => {
          intervalFn(fetchedAll, currCat, catsRef.current.length);
        }, 10000);
      }
    }

    // Not able to reach icons another way using this
    // Parcel MUI mobile-friendly setup.
    const icons = document.querySelectorAll(".runIcon");
    for (const icon of icons) {
      icon.style["font-size"] = "48px";
    }

    return () => {
      clearTimeout(id);
    };
  }, [running, currCat]);

  const mainContent = () => {
    if (running) {
      return (
        <Pygame
          mobile={mobile}
          catsRef={catsRef}
          cat={loading ? loadingCatImg : catsRef.current[currCat]}
          setLoading={setLoading}
          fetchedAll={fetchedAll}
          setFetchedAll={() => setFetchedAll(true)}
        />
      );
    }
    return (
      <Start run={() => setRunning(true)} mobile={mobile} setRuns={setRuns} />
    );
  };

  const extraContent = (
    <Box
      sx={{
        flexBasis: "20%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontSize: mobile ? "34px" : undefined,
        justifyContent: mobile ? "center" : undefined,
        alignItems: mobile ? "center" : undefined,
      }}
    >
      <Button
        startIcon={
          running ? (
            <StopOutlinedIcon className="runIcon" />
          ) : (
            <PlayArrowIcon className="runIcon" />
          )
        }
        variant="contained"
        sx={{
          width: mobile ? "50%" : "100%",
          height: mobile ? "100px" : undefined,
        }}
        onClick={() => {
          setRunning(!running);
          setCurrCat(0);
          if (running) {
            setLoading(true);
          } else {
            shouldUpdateRuns(() => setRuns((runs) => runs + 1));
            setLoading(false);
          }
        }}
      >
        <Typography sx={{ fontSize: mobile ? "34px" : undefined }}>
          {running ? "Stop" : "Run"}
        </Typography>
      </Button>
      <Box
        sx={{
          padding: "0px 15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          "& p": {
            fontSize: mobile ? "34px" : undefined,
          },
          alignSelf: "flex-start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <SiPython fontSize={"28px"} />
          <Typography sx={{ fontSize: "20px", fontWeight: 500 }}>
            catfacts
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={avatar}
            sx={{
              height: "28px",
              width: "28px",
              borderRadius: "100px",
              textAlign: "center",
            }}
          ></Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 300 }}>
            CainBarberry
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 300 }}>
            Sept 18, 2023 &#183; {runs === null ? "--" : runs} Runs
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const order = () => {
    if (mobile) {
      return (
        <>
          {extraContent}
          {mainContent()}
        </>
      );
    }
    return (
      <>
        {mainContent()}
        {extraContent}
      </>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        backgroundColor: "#0E1525",
        height: "100vh",
        width: "100vw",
      }}
    >
      {order()}
    </Box>
  );
}
