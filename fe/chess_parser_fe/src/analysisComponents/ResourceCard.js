import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { LightBulbIcon } from '@heroicons/react/24/outline';

export default function ResourceCard({ open, setOpen, titleText, descriptionText }) {
  return (
    <>
      <Dialog
        open={open}
        handler={console.log("yo")}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        className="p-6" // Added padding to the Dialog
      >
        <div className="flex flex-col items-center">
          {/* Added mt-4 to add margin-top above the icon */}
          <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <LightBulbIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
          {/* Centered and added margin-top to the header */}
          <DialogHeader className="text-center mt-4">{titleText}</DialogHeader>
        </div>
        {/* Added padding to the DialogBody */}
        <DialogBody className="text-base leading-relaxed text-gray-600 px-6 py-4 whitespace-normal break-words">
        {descriptionText}
        </DialogBody>
        {/* Centered the button and added padding to the DialogFooter */}
        <DialogFooter className="flex justify-center px-6">
          <Button color="indigo" onClick={() => setOpen(false)}>
            <span>Return</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
