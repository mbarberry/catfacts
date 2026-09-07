import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PetsIcon from '@mui/icons-material/Pets';
import PublicIcon from '@mui/icons-material/Public';

export default function Cat({ imgSrc, name, description, origin, mobile }) {
  return (
    <Box
      sx={{
        backgroundImage: `url(${imgSrc})`,
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100%',
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '40px',
        }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: mobile ? '34px' : '20px',
            color: 'orange',
          }}>
          <PetsIcon /> {name} <PetsIcon />
        </Typography>
        <Typography
          sx={{
            color: 'dodgerblue',
            fontWeight: 900,
            fontSize: mobile ? '34px' : '20px',
          }}>
          <PublicIcon /> {origin} <PublicIcon />
        </Typography>
        <Typography
          sx={{
            color: 'green',
            fontWeight: 900,
            fontSize: mobile ? '34px' : '20px',
          }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
