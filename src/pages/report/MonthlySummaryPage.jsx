import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';

// Placeholder — page content is deferred; this route exists so the sidebar link resolves.
const MonthlySummaryPage = () => (
  <>
    <PageTitle title="Monthly Summary" />
    <Box sx={{ p: 3 }}>
      <Typography variant="h3">Monthly Summary</Typography>
    </Box>
  </>
);

export default MonthlySummaryPage;
