import { useEffect } from "react";
import Box from "@mui/material/Box";
import { blue } from "@mui/material/colors";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import startCat from "../../public/startCat.avif";
import Cat from "./Cat";
import { LAMBDA_URL, shouldUpdateRuns } from "../utils";

import catData from "../../public/catData.json";

const BUCKET_URL =
  "https://mikesoftwareengineeringtestbucket.s3.us-west-2.amazonaws.com/cats";

export function Start({ run, mobile, setRuns }) {
  return (
    <Box
      sx={{
        backgroundImage: `url(${startCat})`,
        flexBasis: "80%",
        width: "100%",
        height: "100%",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PlayArrowIcon
        onClick={() => {
          run();
          shouldUpdateRuns(() => setRuns((runs) => runs + 1));
        }}
        sx={{
          "&:hover": {
            cursor: "pointer",
          },
          color: `${blue[500]}`,
          fontSize: mobile ? 120 : 40,
        }}
      />
    </Box>
  );
}

export function Pygame({
  mobile,
  setLoading,
  catsRef,
  cat = null,
  fetchedAll,
  setFetchedAll,
}) {
  useEffect(() => {
    const processCats = async () => {
      setLoading(true);
      for (const { name, description, origin, image } of catData) {
        if (!image) continue;
        try {
          // Could just send image.url to Cat component
          // but there is more of a screen flicker loading
          const response = await fetch(
            `${LAMBDA_URL}?url=${encodeURIComponent(`${BUCKET_URL}/${name}.jpeg`)}`,
          );
          const contentType = response.headers.get("content-type");
          const text = await response.text();
          const imgSrc = `data:${contentType};base64,${text}`;
          catsRef.current.push(
            <Cat
              mobile={mobile}
              name={name}
              description={description}
              origin={origin}
              imgSrc={imgSrc}
            />,
          );
          if (catsRef.current.length > 0) {
            setLoading(false);
          }
        } catch (err) {
          console.error(`Error fetching cat image for ${name}`, err);
        }
      }
      setFetchedAll();
    };
    if (!fetchedAll) processCats();
  }, []);

  return <Box sx={{ flexBasis: "80%" }}>{cat}</Box>;
}
