import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { blue } from '@mui/material/colors';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import startCat from '../public/startCat.avif';
import Cat from './Cat';
import { LAMBDA_URL, shouldUpdateRuns } from '../utils';

export function Start({ run, mobile, setRuns }) {
  return (
    <Box
      sx={{
        backgroundImage: `url(${startCat})`,
        flexBasis: '80%',
        width: '100%',
        height: '100%',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <PlayArrowIcon
        onClick={() => {
          run();
          shouldUpdateRuns(() => setRuns((runs) => runs + 1));
        }}
        sx={{
          '&:hover': {
            cursor: 'pointer',
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
    let subscribed = true;
    if (subscribed && !fetchedAll) {
      setLoading(true);
      fetch('https://api.thecatapi.com/v1/breeds', {
        headers: { 'x-api-key': '7ee9d6b7-120d-475e-899d-7c5cb2353ef9' },
      })
        .then((res) => res.json())
        .then(async (data) => {
          for (const { name, description, origin, image } of data) {
            if (!image) continue;

            // Default pics for these cats don't
            // size and appear properly.
            switch (name) {
              case 'Bengal':
                {
                  image.url =
                    'https://inspirationseek.com/wp-content/uploads/2014/08/Bengal-Cat-Pictures.jpg';
                }
                break;
              case 'Dragon Li':
                {
                  image.url =
                    'https://mikesoftwareengineeringtestbucket.s3.us-west-2.amazonaws.com/Dragon_Li.jpg';
                }
                break;
              case 'Ocicat':
                {
                  image.url =
                    'http://www.catconcerns.com/wp-content/uploads/2016/09/1_ocicat.jpg';
                }
                break;
            }

            const response = await fetch(
              `${LAMBDA_URL}?url=${encodeURIComponent(image.url)}`
            );

            const contentType = response.headers.get('content-type');
            const text = await response.text();
            const imgSrc = `data:${contentType};base64,${text}`;
            catsRef.current.push(
              <Cat
                mobile={mobile}
                name={name}
                description={description}
                origin={origin}
                imgSrc={imgSrc}
              />
            );
            if (catsRef.current.length > 0) {
              setLoading(false);
            }
          }
          setFetchedAll();
        });
    }
  }, []);

  return <Box sx={{ flexBasis: '80%' }}>{cat}</Box>;
}
