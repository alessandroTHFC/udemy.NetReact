import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import React from "react";

interface Props {
  options: any[];
  onChange: (event: any) => void;
  selectedValue: string;
}

function RadioButtonGroup({ options, onChange, selectedValue }: Props) {
  return (
    <FormControl>
      <RadioGroup onChange={onChange} value={selectedValue}>
        {/* Loop over sorting options and add Corresponding Radio Button */}
        {options.map(({ value, label }) => (
          <FormControlLabel
            value={value}
            control={<Radio />}
            label={label}
            key={value}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export default RadioButtonGroup;
