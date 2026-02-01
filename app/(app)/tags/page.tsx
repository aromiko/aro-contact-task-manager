import DeleteEntityButton from "@/components/buttons/delete-entity-button";
import TagFormDialog from "@/components/dialogs/tag-form-dialog";
import { ErrorFallback } from "@/components/errors/error-fallback";
import { Button } from "@/components/ui/button";
import { deleteTag } from "@/lib/actions/tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Tags",
};

const TagsPage = async () => {
  const supabase = await createSupabaseServerClient();

  const { data: tags, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name");

  if (error) return <ErrorFallback error={error} title="Failed to load tags" />;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tags</h1>

        <TagFormDialog trigger={<Button>Add tag</Button>} />
      </div>

      <div className="space-y-2">
        {tags?.length === 0 && (
          <p className="text-muted-foreground">No tags yet</p>
        )}

        {tags?.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <span className="font-medium">{tag.name}</span>

            <div className="flex gap-2">
              <TagFormDialog
                trigger={<Button variant="outline">Edit</Button>}
                tag={tag}
              />

              <DeleteEntityButton
                id={tag.id}
                onDelete={deleteTag}
                title="Delete tag?"
                description="This tag will be permanently removed."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
