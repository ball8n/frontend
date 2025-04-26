"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTest: (name: string, startDate: Date, endDate: Date) => void;
}

export function CreateTestDialog({ open, onOpenChange, onCreateTest }: CreateTestDialogProps) {
  const [testName, setTestName] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [dateError, setDateError] = React.useState<string | null>(null);

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setTestName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setNameError(null);
      setDateError(null);
    }
  }, [open]);

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError(null); // Reset errors
    setDateError(null);

    if (!testName.trim()) {
      setNameError("Test name cannot be empty.");
      isValid = false;
    }
    if (!startDate || !endDate) {
      setDateError("Both start and end dates must be selected.");
       isValid = false;
    } else if (endDate < startDate) {
      setDateError("End date cannot be before start date.");
      isValid = false;
    }
    return isValid;
  };


  const handleSubmit = () => {
    if (validateForm()) {
      // Type assertion needed because validation ensures they are defined
      onCreateTest(testName, startDate!, endDate!);
      onOpenChange(false); // Close dialog
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Trigger is handled externally in page.tsx */}
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Create New Price Test</DialogTitle>
          <DialogDescription>
            Enter the details for your new price test. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Test Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="test-name" className="text-right">
              Name
            </Label>
            <Input
              id="test-name"
              value={testName}
              onChange={(e) => {
                setTestName(e.target.value);
                if (nameError) setNameError(null); // Clear error on change
              }}
              placeholder="e.g., Summer Sale Test"
              className="col-span-3 rounded-md"
            />
          </div>
           {nameError && <p className="col-span-4 text-red-500 text-sm text-center -mt-2">{nameError}</p>}

          {/* Start Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal rounded-md",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date: Date | undefined) => {
                       setStartDate(date);
                       if (dateError) setDateError(null); // Clear error
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
          </div>

          {/* End Date */}
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal rounded-md",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date: Date | undefined) => {
                      setEndDate(date);
                      if (dateError) setDateError(null); // Clear error
                    }}
                    disabled={startDate ? { before: startDate } : undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
          </div>
           {dateError && <p className="col-span-4 text-red-500 text-sm text-center -mt-2">{dateError}</p>}
        </div>
        <DialogFooter>
           <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>Cancel</Button>
           <Button type="submit" className="rounded-md bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSubmit}>Create Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 