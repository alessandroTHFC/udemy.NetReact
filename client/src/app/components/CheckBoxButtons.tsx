import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useState } from "react";

interface Props {
  items: string[];
  checked?: string[]; //* checked may be undefined
  onChange: (items: string[]) => void;
}

function CheckBoxButtons({ items, checked, onChange }: Props) {
  const [checkedItems, setCheckedItems] = useState(checked || []); //* COMMENT: check boxes might not be checked so we give the Or empty array option!

  function handleChecked(value: string) {
    //* COMMENT: findIndex will return the index of the item in array that matches the value that's been clicked
    const currentIndex = checkedItems.findIndex((item) => item === value);
    let newChecked: string[] = [];
    //* COMMENT: If index is -1 means it is a new item to add to the array
    if (currentIndex === -1) newChecked = [...checkedItems, value];
    //* Else, item is already checked and we remove it from the array. Keep everything that doesnt = the value
    else newChecked = checkedItems.filter((item) => item !== value);
    setCheckedItems(newChecked);
    onChange(newChecked);
  }

  return (
    <FormGroup>
      {items.map((item) => (
        <FormControlLabel
          control={
            <Checkbox
              //* if index of the item isnt -1 then render it checked
              checked={checkedItems.indexOf(item) !== -1}
              //*
              onClick={() => handleChecked(item)}
            />
          }
          label={item}
          key={item}
        />
      ))}
    </FormGroup>
  );
}

export default CheckBoxButtons;
