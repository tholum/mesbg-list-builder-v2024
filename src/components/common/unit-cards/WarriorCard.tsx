import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FunctionComponent } from "react";
import { heroConstraintData } from "../../../assets/data.ts";
import { useCalculator } from "../../../hooks/calculations-and-displays/useCalculator.ts";
import { useCollectionWarnings } from "../../../hooks/calculations-and-displays/useCollectionWarnings.ts";
import { useOptionDependencies } from "../../../hooks/calculations-and-displays/useOptionDependencies.ts";
import { useRosterInformation } from "../../../hooks/calculations-and-displays/useRosterInformation.ts";
import { useScreenSize } from "../../../hooks/calculations-and-displays/useScreenSize.ts";
import { useUserPreferences } from "../../../state/preference";
import { useThemeContext } from "../../../theme/ThemeContext.tsx";
import { Option } from "../../../types/mesbg-data.types.ts";
import { isSiegeEquipment, SelectedUnit } from "../../../types/roster.ts";
import { slugify } from "../../../utils/string.ts";
import { OptionList } from "../../atoms/options/OptionList.tsx";
import { UnitProfilePicture } from "../../atoms/unit-profile/UnitProfilePicture.tsx";
import { CardActionButtons } from "./buttons/CardActionButtons.tsx";
import { QuantityButtons } from "./buttons/QuantityButtons.tsx";

export type WarriorCardProps = {
  unit: SelectedUnit;
  followerOf?: string;
  warbandId: string;
  warbandNum: number;
  index: number;
  collapsed?: boolean;
  updateUnit: (updatedUnit: SelectedUnit) => void;
  openProfileCard: () => void;
  openDynamicProfileCard?: () => void;
  duplicate: () => void;
  reselect: () => void;
  remove: () => void;
};

export const invalidUnitSelectionBackgroundTint = "rgba(250, 100, 100, 0.15)";
export const WarriorCard: FunctionComponent<WarriorCardProps> = ({
  unit,
  followerOf,
  warbandId,
  warbandNum,
  index,
  updateUnit,
  openProfileCard,
  openDynamicProfileCard,
  duplicate,
  reselect,
  remove,
  collapsed,
}) => {
  const { mode } = useThemeContext();
  const { isCustomRoster } = useRosterInformation();
  const calculator = useCalculator();
  const { checkDependency } = useOptionDependencies(warbandId);
  const screen = useScreenSize();
  const { warnings, available, selected, overExceededCollection } =
    useCollectionWarnings(unit);
  const { preferences } = useUserPreferences();

  const valid =
    isCustomRoster ||
    followerOf === undefined ||
    followerOf === null ||
    heroConstraintData[followerOf].valid_warband_units.includes(
      unit.model_id,
    ) ||
    isSiegeEquipment(unit);

  function updateQuantity(value: number) {
    console.debug("Update warrior quantity.", { value });
    updateUnit(
      calculator.recalculatePointsForUnit({
        ...unit,
        quantity: value,
      }),
    );
  }

  function updateOptions(options: Option[]) {
    console.debug("Update warrior options.", { options });
    updateUnit(
      calculator.recalculatePointsForUnit({
        ...unit,
        options: options,
      }),
    );
  }

  function getOptionsForUnit(): Option[] {
    return unit.options.filter((option, _, self) => {
      if (!option.dependencies || option.dependencies.length === 0)
        return option;

      const optionAvailable = option.dependencies.some(checkDependency);
      if (!optionAvailable && option.quantity > 0) {
        // removing the option from the selected options as it is not available (anymore)
        updateOptions(
          self.map((o) => (o.id === option.id ? { ...o, quantity: 0 } : o)),
        );
      }

      return optionAvailable;
    });
  }

  const selectedOptions = unit.options
    .filter((option) => option.included !== true)
    .filter((option) => option.quantity > 0)
    .map((option) => option.name)
    .join(", ");

  return screen.isMobile ? (
    <Card
      sx={[
        {
          p: 1.5,
          position: "relative",
          zIndex: 0,
          backgroundColor: ({ palette }) =>
            mode === "dark" ? palette.grey["800"] : "",
        },
        !valid
          ? {
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: invalidUnitSelectionBackgroundTint,
                zIndex: 1,
              },
            }
          : {},
      ]}
      elevation={2}
    >
      <Stack direction="row" gap={2} alignItems="center">
        <UnitProfilePicture
          army={unit.profile_origin}
          profile={unit.name}
          size="smaller"
        />
        <Stack direction="column" justifyContent="center" flexGrow={1}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={
              warnings === "on" && overExceededCollection
                ? "warning.dark"
                : "inherit"
            }
          >
            {unit.quantity ?? 1}x {unit.name}
          </Typography>
          <Typography
            data-test-id={`unit-card--points--w${warbandNum}-i${index}`}
            data-test-unit-name={`unit-card--points--${slugify(unit.name)}`}
          >
            Points: <b>{unit.pointsTotal}</b> (per unit: {unit.pointsPerUnit})
          </Typography>
          {warnings === "on" && (
            <Collapse in={!collapsed}>
              <Typography
                sx={{ textAlign: "end" }}
                color={
                  overExceededCollection
                    ? mode === "dark"
                      ? "error.light"
                      : "error.dark"
                    : "inherit"
                }
              >
                {available === 0
                  ? "Not in collection"
                  : `Left in collection: ${available - selected}`}
              </Typography>
            </Collapse>
          )}
          <Collapse in={collapsed}>
            {unit.opt_mandatory && !selectedOptions && (
              <Typography color="error" variant="body2">
                <i>No option selected!</i>
              </Typography>
            )}
            <Typography variant="body2">
              <i>{selectedOptions}</i>
            </Typography>
          </Collapse>
        </Stack>
      </Stack>
      <Collapse in={!collapsed}>
        {!!unit.options.length && (
          <Box sx={{ px: 2, py: 1 }}>
            <OptionList
              options={getOptionsForUnit()}
              variant={
                isCustomRoster
                  ? "multiple"
                  : unit.opt_mandatory
                    ? "single-mandatory"
                    : "single"
              }
              onSelect={updateOptions}
              warbandNum={warbandNum}
              index={index}
              unitName={unit.name}
            />
          </Box>
        )}
      </Collapse>
      <Collapse in={!(collapsed && !preferences.forceShowCardActionButtons)}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 2, mr: 2 }}
          gap={8}
        >
          <QuantityButtons
            quantity={unit.quantity}
            updateQuantity={updateQuantity}
            warbandNum={warbandNum}
            index={index}
            unitName={unit.name}
            collapsed={collapsed}
          />
          <CardActionButtons
            duplicate={!isSiegeEquipment(unit) ? duplicate : null}
            remove={remove}
            reselect={!isSiegeEquipment(unit) ? reselect : null}
            openProfileCard={!isSiegeEquipment(unit) ? openProfileCard : null}
            openDynamicProfileCard={
              !isSiegeEquipment(unit) ? openDynamicProfileCard : null
            }
            warbandNum={warbandNum}
            index={index}
            unitName={unit.name}
          />
        </Stack>
      </Collapse>
    </Card>
  ) : (
    <Card
      sx={[
        {
          p: collapsed ? 0.25 : 1.5,
          pr: collapsed ? 1 : 1.5,
          position: "relative",
          zIndex: 0,
          transition: "padding 0.5s",
          backgroundColor: ({ palette }) =>
            mode === "dark" ? palette.grey["800"] : "",
        },
        !valid
          ? {
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: invalidUnitSelectionBackgroundTint,
                zIndex: 1,
              },
            }
          : {},
      ]}
      elevation={2}
    >
      <Stack direction="row" gap={2}>
        <Stack
          direction="column"
          gap={1}
          sx={{
            p: 0.5,
            width: 105,
          }}
        >
          <Collapse in={!collapsed} unmountOnExit={true}>
            <UnitProfilePicture
              army={unit.profile_origin}
              profile={unit.name}
            />
          </Collapse>
          <QuantityButtons
            quantity={unit.quantity}
            updateQuantity={updateQuantity}
            warbandNum={warbandNum}
            index={index}
            unitName={unit.name}
            collapsed={collapsed}
          />
        </Stack>
        <Stack flexGrow={1} sx={{ px: 1 }} direction="row">
          <Stack
            direction="column"
            flexGrow={1}
            sx={{
              justifyContent: !collapsed ? "start" : "center",
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={
                  warnings === "on" && overExceededCollection
                    ? "warning.dark"
                    : "inherit"
                }
              >
                {unit.quantity ?? 1}x {unit.name}{" "}
                {collapsed && (
                  <span
                    style={{ fontWeight: "normal" }}
                    data-test-id={`quantity--w${warbandNum}-i${index}`}
                    data-test-name={`quantity--${slugify(unit.name)}`}
                  >
                    ({unit.pointsTotal ?? 1} pts.)
                  </span>
                )}
                <Collapse in={collapsed}>
                  {unit.opt_mandatory && !selectedOptions && (
                    <Typography color="error" variant="body2">
                      <i>No option selected!</i>
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <i>{selectedOptions}</i>
                  </Typography>
                </Collapse>
              </Typography>
            </Stack>
            <Collapse in={!collapsed}>
              {!!unit.options.length && (
                <OptionList
                  options={getOptionsForUnit()}
                  variant={
                    isCustomRoster
                      ? "multiple"
                      : unit.opt_mandatory
                        ? "single-mandatory"
                        : "single"
                  }
                  onSelect={updateOptions}
                  warbandNum={warbandNum}
                  index={index}
                  unitName={unit.name}
                />
              )}
            </Collapse>
          </Stack>
          <Stack
            alignItems="end"
            sx={{
              justifyContent: collapsed ? "center" : "space-between",
              transition: "justify-content 0.3s",
            }}
          >
            <Collapse in={!collapsed}>
              <Typography
                data-test-id={`unit-card--points--w${warbandNum}-i${index}`}
                data-test-unit-name={`unit-card--points--${slugify(unit.name)}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                  gap: 0.5,
                }}
              >
                Points: <b>{unit.pointsTotal}</b> (per unit:{" "}
                {unit.pointsPerUnit})
              </Typography>
              {warnings === "on" && (
                <Typography
                  sx={{ textAlign: "end" }}
                  color={
                    overExceededCollection
                      ? mode === "dark"
                        ? "error.light"
                        : "error.dark"
                      : "inherit"
                  }
                >
                  {available === 0
                    ? "Not in collection"
                    : `Left in collection: ${available - selected}`}
                </Typography>
              )}
            </Collapse>

            <CardActionButtons
              duplicate={!isSiegeEquipment(unit) ? duplicate : null}
              remove={remove}
              reselect={!isSiegeEquipment(unit) ? reselect : null}
              openProfileCard={!isSiegeEquipment(unit) ? openProfileCard : null}
              warbandNum={warbandNum}
              index={index}
              unitName={unit.name}
            />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};
