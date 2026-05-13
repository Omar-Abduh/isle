---
name: form-ux
description: Form design and UX patterns for react-hook-form + Zod — validation, error states, loading, accessibility, field layouts
---

## This Project's Stack

- **Validation**: Zod schemas with `z.object()`
- **Form state**: react-hook-form with `zodResolver`
- **UI**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from `@isle/shared`
- **Pattern**: See `HabitFormDrawer.tsx` for the reference implementation

## Form Structure Pattern

```tsx
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['daily', 'weekly', 'monthly']),
})

type FormValues = z.infer<typeof formSchema>

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: '', type: 'daily' },
})

const handleSubmit = (values: FormValues) => {
  mutation.mutate(values)
}

return (
  <Form {...form}>
    <form id="habit-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FormField name="name" render={...} />
    </form>
  </Form>
)
```

## Validation UX

- **Inline errors**: Show `FormMessage` immediately on blur (set `mode: 'onBlur'` or `mode: 'onTouched'`)
- **Async validation**: Debounce async checks (e.g., name uniqueness) with `useCallback` + debounce
- **Submit validation**: Validate all fields on submit; scroll to first error
- `aria-invalid` is handled by the Form component — verify it's correct
- `aria-describedby` links input to error message — verify it's wired

## Field States

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Normal label + input | — |
| Focus | Ring indicator (`focus-visible:ring`) | Tab or click to focus |
| Filled | Input has value | Show clear/reset button if applicable |
| Error | Red border + `FormMessage` | On blur or submit |
| Disabled | Reduced opacity, cursor not-allowed | Field not interactive |
| Loading | Spinner in button | Submit button disabled, `isPending` from mutation |

## Submit Button Pattern

```tsx
<Button type="submit" disabled={isPending}>
  {isPending ? <Spinner /> : 'Save'}
</Button>
```

- Use `form="habit-form"` attribute to link button outside the `<form>` element
- Disable during submission to prevent double-submit
- Show spinner during `isPending` state from TanStack Query

## Multi-step / Dynamic Fields

- Array fields: `useFieldArray` for dynamic add/remove (see sub-habits in `HabitFormDrawer`)
- Each array item needs a unique `id` (use `field.id` from `useFieldArray`)
- Add/remove buttons should have clear labels

## Accessibility

- Every input needs a `<label>` (handled by `FormLabel`)
- Group related fields with `<fieldset>` and `<legend>` for radio groups, checkboxes
- Error messages linked via `aria-describedby`
- Autocomplete attributes: `autocomplete="on"` with appropriate values (name, email, tel, etc.)
- Tab order follows visual order

## Error Handling

- Show toast on mutation error: `toast({ title: 'Failed to save', variant: 'destructive' })`
- Don't clear form on error — preserve user input
- Network errors: show retry button
- Validation errors: focus the first errored field
