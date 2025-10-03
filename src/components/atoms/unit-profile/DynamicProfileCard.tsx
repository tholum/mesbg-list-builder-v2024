import { Box, Typography, styled } from "@mui/material";
import { FunctionComponent, forwardRef } from "react";
import { DatabaseRow } from "../../../pages/database/data.ts";

const CardContainer = styled(Box)({
  width: "650px",
  minHeight: "400px",
  backgroundColor: "#f5e6d3",
  border: "1px solid #d4c4a8",
  borderRadius: "12px",
  padding: "20px",
  fontFamily: "'Times New Roman', 'Georgia', serif",
  color: "#000000",
  position: "relative",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
  display: "grid",
  gridTemplateColumns: "1fr 250px",
  gap: "20px",
});

const LeftColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const RightColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
});

const ProfileHeader = styled(Box)({
  marginBottom: "8px",
});

const ProfileName = styled(Typography)({
  fontSize: "22px",
  fontWeight: "bold",
  color: "#8B0000",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  lineHeight: 1.2,
  marginBottom: "4px",
});

const ProfileMeta = styled(Typography)({
  fontSize: "11px",
  fontWeight: "bold",
  color: "#8B0000",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
});

const PlaceholderImage = styled(Box)({
  width: "200px",
  height: "200px",
  backgroundColor: "#e8dcc8",
  border: "3px solid #c4a574",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#8b7355",
  fontSize: "12px",
  fontWeight: "bold",
  textAlign: "center",
  padding: "20px",
});

const StatsTable = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  gap: "2px",
  backgroundColor: "#f8f0dc",
  border: "1px solid #d4c4a8",
  borderRadius: "4px",
  padding: "6px",
});

const StatCell = styled(Box)({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2px",
});

const StatLabel = styled(Typography)({
  fontSize: "10px",
  fontWeight: "bold",
  color: "#000000",
  marginBottom: "2px",
});

const StatValue = styled(Typography)({
  fontSize: "14px",
  fontWeight: "bold",
  color: "#000000",
});

const HeroStatsContainer = styled(Box)({
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  marginTop: "8px",
});

const HeroStatBadge = styled(Box)({
  width: "50px",
  height: "50px",
  border: "2px solid #c4a574",
  borderRadius: "8px",
  backgroundColor: "#faf8f4",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
});

const HeroStatLabel = styled(Typography)({
  fontSize: "9px",
  fontWeight: "bold",
  color: "#666",
  textTransform: "uppercase",
});

const HeroStatValue = styled(Typography)({
  fontSize: "18px",
  fontWeight: "bold",
  color: "#000000",
});

const SectionTitle = styled(Typography)({
  fontSize: "12px",
  fontWeight: "bold",
  color: "#8B0000",
  textTransform: "uppercase",
  marginTop: "10px",
  marginBottom: "4px",
  letterSpacing: "0.3px",
});

const SectionContent = styled(Typography)({
  fontSize: "11px",
  color: "#000000",
  lineHeight: 1.4,
  marginBottom: "4px",
});

const AbilityName = styled("span")({
  fontWeight: "bold",
  color: "#000000",
});

const AbilityType = styled("span")<{ type: "Active" | "Passive" }>(
  ({ type }) => ({
    fontWeight: "bold",
    color: type === "Active" ? "#D4A528" : "#6B8E23",
  }),
);

const MagicPowersTable = styled(Box)({
  marginTop: "6px",
});

const MagicPowerRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr",
  gap: "8px",
  fontSize: "11px",
  marginBottom: "2px",
  padding: "2px 0",
});

const MagicPowerHeader = styled(Typography)({
  fontSize: "10px",
  fontWeight: "bold",
  color: "#8B0000",
  borderBottom: "1px solid #d4c4a8",
  paddingBottom: "2px",
  marginBottom: "4px",
});

interface DynamicProfileCardProps {
  row: DatabaseRow;
}

export const DynamicProfileCard: FunctionComponent<DynamicProfileCardProps> =
  forwardRef<HTMLDivElement, DynamicProfileCardProps>(({ row }, ref) => {
    const profile = row.profile;
    const hasHeroStats = row.M !== "-" || row.W !== "-" || row.F !== "-";

    // Create metadata line (unit type and origin)
    const unitTypes = Array.isArray(row.unit_type)
      ? row.unit_type.join(", ")
      : row.unit_type;

    return (
      <CardContainer ref={ref}>
        <LeftColumn>
          {/* Header */}
          <ProfileHeader>
            <ProfileName>{row.name}</ProfileName>
            <ProfileMeta>
              {unitTypes} | {row.profile_origin}
            </ProfileMeta>
          </ProfileHeader>

          {/* Main Stats Table */}
          <StatsTable>
            <StatCell>
              <StatLabel>Mv</StatLabel>
              <StatValue>{profile.Mv || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>Fv</StatLabel>
              <StatValue>{profile.Fv || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>Sv</StatLabel>
              <StatValue>{profile.Sv || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>S</StatLabel>
              <StatValue>{profile.S || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>D</StatLabel>
              <StatValue>{profile.D || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>A</StatLabel>
              <StatValue>{profile.A || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>W</StatLabel>
              <StatValue>{profile.W || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>C</StatLabel>
              <StatValue>{profile.C || "-"}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>I</StatLabel>
              <StatValue>{profile.I || "-"}</StatValue>
            </StatCell>
          </StatsTable>

          {/* Hero Stats (M/W/F) */}
          {hasHeroStats && (
            <HeroStatsContainer>
              <HeroStatBadge>
                <HeroStatLabel>M</HeroStatLabel>
                <HeroStatValue>{row.M}</HeroStatValue>
              </HeroStatBadge>
              <HeroStatBadge>
                <HeroStatLabel>W</HeroStatLabel>
                <HeroStatValue>{row.W}</HeroStatValue>
              </HeroStatBadge>
              <HeroStatBadge>
                <HeroStatLabel>F</HeroStatLabel>
                <HeroStatValue>{row.F}</HeroStatValue>
              </HeroStatBadge>
            </HeroStatsContainer>
          )}

          {/* Wargear */}
          {profile.wargear && profile.wargear.length > 0 && (
            <>
              <SectionTitle>Wargear</SectionTitle>
              <SectionContent>{profile.wargear.join(", ")}</SectionContent>
            </>
          )}

          {/* Special Rules */}
          {profile.special_rules && profile.special_rules.length > 0 && (
            <>
              <SectionTitle>Special Rules</SectionTitle>
              <SectionContent>
                {profile.special_rules.join(", ")}
              </SectionContent>
            </>
          )}

          {/* Active/Passive Rules */}
          {profile.active_or_passive_rules &&
            profile.active_or_passive_rules.length > 0 && (
              <>
                {profile.active_or_passive_rules.map((rule, index) => (
                  <Box key={index}>
                    <SectionContent>
                      <AbilityName>{rule.name}</AbilityName> -{" "}
                      <AbilityType type={rule.type}>{rule.type}</AbilityType> -{" "}
                      {rule.description}
                    </SectionContent>
                  </Box>
                ))}
              </>
            )}

          {/* Heroic Actions */}
          {profile.heroic_actions && profile.heroic_actions.length > 0 && (
            <>
              <SectionTitle>Heroic Actions</SectionTitle>
              <SectionContent>
                {profile.heroic_actions.join(", ")}
              </SectionContent>
            </>
          )}

          {/* Magical Powers */}
          {profile.magic_powers && profile.magic_powers.length > 0 && (
            <>
              <SectionTitle>Magical Powers</SectionTitle>
              <MagicPowersTable>
                <MagicPowerRow>
                  <MagicPowerHeader>Power</MagicPowerHeader>
                  <MagicPowerHeader>Range</MagicPowerHeader>
                  <MagicPowerHeader>Cast</MagicPowerHeader>
                </MagicPowerRow>
                {profile.magic_powers.map((power, index) => (
                  <MagicPowerRow key={index}>
                    <Typography sx={{ fontSize: "11px" }}>
                      {power.name}
                    </Typography>
                    <Typography sx={{ fontSize: "11px" }}>
                      {power.range}
                    </Typography>
                    <Typography sx={{ fontSize: "11px" }}>
                      {power.cast}
                    </Typography>
                  </MagicPowerRow>
                ))}
              </MagicPowersTable>
            </>
          )}
        </LeftColumn>

        <RightColumn>
          {/* Placeholder Image */}
          <PlaceholderImage>PROFILE IMAGE</PlaceholderImage>
        </RightColumn>
      </CardContainer>
    );
  });

DynamicProfileCard.displayName = "DynamicProfileCard";
