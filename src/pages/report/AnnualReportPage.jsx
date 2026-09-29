import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';

// Placeholder — page content for /report/report is deferred; this route exists so the
// sidebar/topbar shell can be viewed and tested against it.
const AnnualReportPage = () => (
  <>
    <PageTitle title="Annual Report" />
    <Box sx={{ p: 3 }}>
      <Typography variant="h3">Annual Report</Typography>
    </Box>
  </>
);

export default AnnualReportPage;
