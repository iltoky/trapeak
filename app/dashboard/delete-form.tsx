"use client";

type DeleteFormProps = Readonly<{
  action: string;
  confirmation: string;
  label?: string;
}>;

export function DeleteForm({
  action,
  confirmation,
  label = "Delete",
}: DeleteFormProps) {
  return (
    <form
      action={action}
      method="post"
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
    >
      <button type="submit">{label}</button>
    </form>
  );
}
