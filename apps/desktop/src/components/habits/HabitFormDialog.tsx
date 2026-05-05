import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HabitResponse } from "../../lib/api-client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  habitType: z.enum(["POSITIVE", "NEGATIVE", "COMPOSITE"]),
  rrule: z.string().min(1, "Frequency is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: HabitResponse | null;
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function HabitFormDialog({ open, onOpenChange, habit, onSubmit, isPending }: HabitFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      habitType: "POSITIVE",
      rrule: "FREQ=DAILY",
    },
  });

  useEffect(() => {
    if (habit && open) {
      form.reset({
        name: habit.name,
        description: habit.description || "",
        habitType: habit.habitType,
        rrule: habit.rrule || "FREQ=DAILY",
      });
    } else if (open && !habit) {
      form.reset({
        name: "",
        description: "",
        habitType: "POSITIVE",
        rrule: "FREQ=DAILY",
      });
    }
  }, [habit, open, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "New Habit"}</DialogTitle>
          <DialogDescription>
            {habit ? "Make changes to your habit here." : "Add a new habit to your daily routine."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Read a book" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Read at least 10 pages" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="habitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="POSITIVE">Build a good habit</SelectItem>
                      <SelectItem value="NEGATIVE">Break a bad habit</SelectItem>
                      <SelectItem value="COMPOSITE">Multi-step habit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rrule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FREQ=DAILY">Daily</SelectItem>
                      <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Weekdays</SelectItem>
                      <SelectItem value="FREQ=WEEKLY">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
