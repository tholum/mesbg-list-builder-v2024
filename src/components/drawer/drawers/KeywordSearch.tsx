import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  InputAdornment,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Fragment, FunctionComponent, useState } from "react";

export const KeywordSearch: FunctionComponent<{
  keywords: { name: string; active_passive?: string; description: string }[];
}> = ({ keywords }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keywordList, setKeywordList] = useState(keywords);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const newKeywordList = keywords.filter((kw) =>
      kw.name.toLowerCase().includes(e.target.value.trim().toLowerCase()),
    );
    setKeywordList(newKeywordList);
  };

  return (
    <Fragment>
      <Box sx={{ mb: 1 }}>
        <TextField
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search..."
        />
      </Box>
      {keywordList.map((kw) => (
        <Fragment key={kw.name}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1" component="div">
                <b>{kw.name}</b>{" "}
                {kw.active_passive ? <i>({kw.active_passive})</i> : ""}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <span
                  dangerouslySetInnerHTML={{
                    __html: kw.description.replaceAll("\n", "<br />"),
                  }}
                />
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Fragment>
      ))}
    </Fragment>
  );
};
