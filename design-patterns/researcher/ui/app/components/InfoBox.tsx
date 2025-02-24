import { Box, Typography, Paper } from "@mui/material"
import { styled } from "@mui/material/styles"
import type { SvgIconComponent } from "@mui/icons-material"

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: "2.5rem",
  marginBottom: theme.spacing(2),
  color: "white",
}))

interface InfoBoxProps {
  icon: SvgIconComponent
  title: string
  description: string
}

export default function InfoBox({ icon: Icon, title, description }: InfoBoxProps) {
  return (
    <StyledPaper elevation={3}>
      <IconWrapper>
        <Icon fontSize="inherit" />
      </IconWrapper>
      <Typography variant="h6" component="h3" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
        {description}
      </Typography>
    </StyledPaper>
  )
}

