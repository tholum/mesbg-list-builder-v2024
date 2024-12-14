import { FormGroup, FormHelperText } from "@mui/material";
import { FunctionComponent } from "react";
import { Option } from "../../../types/mesbg-data.types.ts";
import { slugify } from "../../../utils/string.ts";
import { OptionItem } from "./OptionItem.tsx";

type OptionVariant = "multiple" | "single" | "single-mandatory";

export type OptionListProps = {
  options: (Option & { selectable?: boolean })[];
  variant: OptionVariant;
  onSelect: (option: Option[]) => void;

  unitName: string;
  warbandNum: number;
  index: number;
};

export const OptionList: FunctionComponent<OptionListProps> = ({
  options,
  variant,
  onSelect,
  unitName,
  warbandNum,
  index,
}) => {
  const multiple = variant === "multiple";
  const mandatory = variant === "single-mandatory";

  function updatedMultiSelection(
    { id, type, name }: Pick<Option, "id" | "name" | "type">,
    selected: boolean,
  ): Option[] {
    return options.map((o) => {
      // select the chosen option
      if (o.id === id) {
        return { ...o, quantity: selected ? 1 : 0 };
      }
      // deselect any option of the same type
      else if (!!o.type && o.type === type && selected) {
        return { ...o, quantity: o.included ? 1 : 0 };
      }
      // deselect Pippin if shadowfax is removed
      else if (name === "Shadowfax" && !selected && o.name === "Pippin") {
        return { ...o, quantity: 0 };
      }
      // return any other option unchanged
      else {
        return o;
      }
    });
  }

  function updatedSingularSelection(
    { id }: Pick<Option, "id">,
    selected: boolean,
  ): Option[] {
    return options.map((o) => {
      // select the chosen option
      if (o.id === id) {
        return { ...o, quantity: selected ? 1 : 0 };
      }
      // deselect any other option
      else {
        return { ...o, quantity: o.included ? 1 : 0 };
      }
    });
  }

  function onSelectOption(option: Option, selected: boolean) {
    if (variant === "multiple")
      onSelect(updatedMultiSelection(option, selected));
    else onSelect(updatedSingularSelection(option, selected));
  }

  return (
    <FormGroup
      aria-labelledby="wargear-options"
      aria-required={mandatory}
      data-test-id={`option-list--w${warbandNum}-i${index}`}
      data-test-unit-name={`option-list--${slugify(unitName)}`}
    >
      {!multiple && (
        <FormHelperText>
          You can only select a single wargear option
        </FormHelperText>
      )}
      {options.map((option, optionIndex) => (
        <OptionItem
          key={option.id}
          option={option}
          selectable={option.selectable}
          onSelect={(selected) => onSelectOption(option, selected)}
          testId={`option-toggle--w${warbandNum}-i${index}--o${optionIndex}`}
          testName={`option-toggle--${slugify(unitName)}--${slugify(option.name)}`}
        />
      ))}
      {mandatory && !options.find((option) => option.quantity === 1) && (
        <FormHelperText
          sx={{
            marginBottom: ".8rem",
            color: ({ palette }) => palette.error.dark,
          }}
        >
          You must select one option for this model
        </FormHelperText>
      )}
    </FormGroup>
  );
};
