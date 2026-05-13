import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useIsMobile } from "../../hooks/use-mobile";
import type { HabitResponse } from "../../types/api";
import { cn } from "../../lib/utils";
import { RecurrencePicker } from "./RecurrencePicker";
import { getRandomColor } from "../../lib/colors";
import { Plus, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  habitType: z.enum(["POSITIVE", "NEGATIVE", "COMPOSITE"]),
  rrule: z.string().min(1, "Frequency is required"),
  subHabits: z.array(z.string().min(1, "Task name cannot be empty")).optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface HabitFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: HabitResponse | null;
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function HabitFormDrawer({ open, onOpenChange, habit, onSubmit, isPending }: HabitFormDrawerProps) {
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      habitType: "POSITIVE",
      rrule: "FREQ=DAILY",
      subHabits: [],
    },
  });

  useEffect(() => {
    if (habit && open) {
      form.reset({
        name: habit.name,
        description: habit.description || "",
        habitType: habit.habitType,
        rrule: habit.rrule || "FREQ=DAILY",
        subHabits: habit.subHabits?.map(s => s.name) || [],
        color: habit.color || getRandomColor(),
      });
    } else if (open && !habit) {
      form.reset({
        name: "",
        description: "",
        habitType: "POSITIVE",
        rrule: "FREQ=DAILY",
        subHabits: [],
        color: getRandomColor(),
      });
    }
  }, [habit, open, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "habitType" && value.habitType !== "COMPOSITE") {
        form.setValue("subHabits", []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent
        className={cn(
          "bg-background text-foreground border-border/40",
          "data-[vaul-drawer-direction=right]:w-[90vw] data-[vaul-drawer-direction=right]:sm:max-w-md",
          "data-[vaul-drawer-direction=bottom]:max-h-[90vh] flex flex-col p-0"
        )}
      >
        <DrawerHeader className="p-6 pb-2 shrink-0 border-b border-border/40 relative">
          <DrawerTitle className="text-xl font-bold tracking-tight">
            {habit ? "Edit Habit" : "New Habit"}
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-muted-foreground text-sm">
            {habit ? "Make changes to your habit here." : "Add a new habit to your daily routine."}
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-8 w-8 rounded-full hidden sm:flex"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form id="habit-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
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
                    <FormControl>
                      <RecurrencePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("habitType") === "COMPOSITE" && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <label className="text-sm font-medium leading-none">Sub-tasks</label>
                  <div className="space-y-2">
                    {form.watch("subHabits")?.map((subHabit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={subHabit || ""}
                          onChange={(e) => {
                            const current = [...(form.getValues("subHabits") || [])];
                            current[index] = e.target.value;
                            form.setValue("subHabits", current);
                          }}
                          placeholder={`Step ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const current = [...(form.getValues("subHabits") || [])];
                            current.splice(index, 1);
                            form.setValue("subHabits", current);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed gap-2 text-muted-foreground"
                      onClick={() => {
                        const current = [...(form.getValues("subHabits") || [])];
                        form.setValue("subHabits", [...current, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="habit-form" disabled={isPending} className="flex-1">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
