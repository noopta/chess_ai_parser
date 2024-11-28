import {
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
  } from "@material-tailwind/react";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CursorArrowRaysIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
   
export default function DropdownMenu({handleStateChange, id, title, listItems}) {
    const [menuTitle, setMenuTitle] = useState(title);
    
    const handleMenuItemClick = (item) => {
        setMenuTitle(item);
        handleStateChange(item);
        console.log("item clicked " + item);
    }
    
    return (
        <Menu
        placement="right"
        animate={{
            mount: { y: 0 },
            unmount: { y: 25 },
        }}
        >
        <MenuHandler>
        <Button
            id={id}
            variant="text"
            className="flex items-center gap-3 text-base font-normal capitalize tracking-normal text-white"
        >
            {menuTitle}{" "}
            <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3.5 w-3.5`}
            />
        </Button>
        </MenuHandler>
        <MenuList>
            { listItems.map((item, index) => ( 
                <MenuItem key={index} onClick={() => handleMenuItemClick(item)}>{item}</MenuItem>
            ))
            }   
        </MenuList>
        </Menu>
    );
}