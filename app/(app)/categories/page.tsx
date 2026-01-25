import DeleteEntityButton from "@/components/buttons/delete-entity-button";
import CategoryFormDialog from "@/components/dialogs/category-form-dialog";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/actions/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CategoriesPage = async () => {
  const supabase = await createSupabaseServerClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) return <pre>{error.message}</pre>;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>

        <CategoryFormDialog trigger={<Button>Add category</Button>} />
      </div>

      <div className="space-y-2">
        {categories?.length === 0 && (
          <p className="text-muted-foreground">No categories yet</p>
        )}

        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <span className="font-medium">{category.name}</span>

            <div className="flex gap-2">
              <CategoryFormDialog
                trigger={<Button variant="outline">Edit</Button>}
                category={category}
              />

              <DeleteEntityButton
                id={category.id}
                onDelete={deleteCategory}
                title="Delete category?"
                description="This category will be permanently removed."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
